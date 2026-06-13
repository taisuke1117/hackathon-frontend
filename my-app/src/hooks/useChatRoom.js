import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────
// useChatRoom カスタムフック
//
// 買い手チャット（BuyerChatRoom）と売り手チャット（SellerChatRoom）
// どちらでも使うチャット処理を1か所にまとめたフック
//
// 主な処理:
//  ① roomId='new' のときはチャットルームを作成してURLを差し替える
//  ② 既存ルームの場合はメッセージ一覧を取得して表示
//  ③ 8秒ごとにポーリング（定期取得）して相手のメッセージを反映
//  ④ メッセージ送信
//  ⑤ 最新メッセージへの自動スクロール
//
// 引数:
//  productId - 対象商品のID（URLパラメータから来る）
//  roomId    - チャットルームのID（'new' なら作成する）
// ─────────────────────────────────────────────────────────
export function useChatRoom(productId, roomId) {
  const navigate = useNavigate();

  // refreshBadges: チャットを既読にしたあとヘッダーのバッジ数を更新するために使う
  const { refreshBadges } = useAuth();

  // chatEndRef: メッセージ一覧の末尾DOM要素への参照
  // 新しいメッセージが来たときにここまで自動スクロールする
  const chatEndRef = useRef(null);

  // room: チャットルームの全情報（メッセージ一覧・商品情報・値引き状態など）
  //       バックエンドの GET /api/chatrooms/{id} のレスポンスがそのまま入る
  const [room, setRoom] = useState(null);

  // inputText: テキストエリアに入力中の文字列
  const [inputText, setInputText] = useState('');

  // ── ① ルーム情報の再取得（ポーリングでも使うのでuseCallbackでメモ化） ──
  const refresh = useCallback(async () => {
    // roomId='new' のときはまだルームが存在しないのでスキップ
    if (roomId === 'new') return;
    try {
      const detail = await apiFetch(`/api/chatrooms/${roomId}`);
      setRoom(detail);
    } catch {
      // ポーリング中の一時的な失敗（ネットワーク揺れなど）は無視する
      // エラーを出すと8秒ごとにエラーダイアログが出てしまう
    }
  }, [roomId]);

  // ── ② 初回マウント時の処理 ──────────────────────────────────
  useEffect(() => {
    // cancelled フラグ: コンポーネントが消えた後に setRoom が呼ばれないよう防ぐ
    let cancelled = false;

    const setup = async () => {
      try {
        let actualRoomId = roomId;

        if (roomId === 'new') {
          // チャットルームがまだない → バックエンドに作成をリクエスト
          // POST /api/chatrooms はすでに存在する場合は既存のルームIDを返す（二重作成しない）
          const res = await apiFetch('/api/chatrooms', {
            method: 'POST',
            body: { product_id: Number(productId) },
          });
          actualRoomId = res.chatroom_id;

          // URLを /chat/{productId}/new → /chat/{productId}/{actualRoomId} に差し替え
          // replace:true なので「戻る」ボタンで 'new' のURLには戻らない
          navigate(`/chat/${productId}/${actualRoomId}`, { replace: true });
          return; // navigateするとuseEffectが再実行されるのでここで終了
        }

        // 既存ルームのメッセージ一覧を取得
        const detail = await apiFetch(`/api/chatrooms/${actualRoomId}`);
        if (!cancelled) setRoom(detail);

        // 既読化: 自分が見た = 相手のメッセージを既読にする
        // 失敗してもチャット閲覧には影響しないので .catch で握りつぶす
        // 既読化後にバッジ数を更新（ヘッダーの数字を減らす）
        apiFetch(`/api/chatrooms/${actualRoomId}/read`, { method: 'PUT' })
          .then(refreshBadges)
          .catch(() => {});

      } catch (err) {
        alert(`チャットの読み込みに失敗しました: ${err.message}`);
        navigate(-1); // 失敗したら前のページに戻る
      }
    };

    setup();
    return () => { cancelled = true; }; // クリーンアップ: stale setRoomを防ぐ
  }, [productId, roomId, navigate, refreshBadges]);
  // 依存配列にroomIdがあるので、navigateでroomIdが変わったときに再実行される

  // ── ③ 8秒ごとのポーリング ───────────────────────────────────
  // WebSocketを使っていないため、一定間隔でAPIを叩いて最新メッセージを取得する
  // 8秒: サーバー負荷とリアルタイム性のバランス値
  useEffect(() => {
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer); // アンマウント時にタイマーをクリア
  }, [refresh]);

  // ── ④ 最新メッセージへの自動スクロール ──────────────────────
  // メッセージ数が増えたとき（新着メッセージ受信 or 送信後）に一番下までスクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages?.length]); // メッセージ件数が変わったときだけ発火

  // ── ⑤ メッセージ送信 ────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault(); // フォームのデフォルト動作（ページリロード）を防ぐ
    if (!inputText.trim()) return; // 空文字・スペースだけなら送信しない

    const text = inputText;
    setInputText(''); // 先にUIをクリアして「送信した感」を出す（楽観的UI）

    try {
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/messages`, {
        method: 'POST',
        body: { content: text },
      });
      // 送信後に最新メッセージ一覧を再取得して画面を更新
      await refresh();
    } catch (err) {
      alert(`送信に失敗しました: ${err.message}`);
      // 送信失敗したらテキストをテキストエリアに戻す
      setInputText(text);
    }
  };

  // フック利用側（BuyerChatRoom, SellerChatRoom）に必要な値と関数を返す
  return { room, inputText, setInputText, handleSend, refresh, chatEndRef };
}
