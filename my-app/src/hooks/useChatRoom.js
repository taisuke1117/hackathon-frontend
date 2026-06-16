import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

// BuyerChatRoom / SellerChatRoom 共通のチャット処理フック
export function useChatRoom(productId, roomId) {
  const navigate = useNavigate();
  const { refreshBadges } = useAuth();
  const chatEndRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [inputText, setInputText] = useState('');

  // ポーリングでも使うのでuseCallbackでメモ化
  const refresh = useCallback(async () => {
    if (roomId === 'new') return;
    try {
      const detail = await apiFetch(`/api/chatrooms/${roomId}`);
      setRoom(detail);
    } catch {
      // ポーリング中の一時的な失敗は無視（8秒ごとにエラーが出ないよう）
    }
  }, [roomId]);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        let actualRoomId = roomId;

        if (roomId === 'new') {
          // すでに存在する場合は既存IDを返す（二重作成しない）
          const res = await apiFetch('/api/chatrooms', {
            method: 'POST',
            body: { product_id: Number(productId) },
          });
          actualRoomId = res.chatroom_id;
          // replace:true で「戻る」ボタンから new URLには戻らない
          navigate(`/chat/${productId}/${actualRoomId}`, { replace: true });
          return; // navigateするとuseEffectが再実行されるのでここで終了
        }

        const detail = await apiFetch(`/api/chatrooms/${actualRoomId}`);
        if (!cancelled) setRoom(detail);

        // 既読化後にバッジ数を更新
        apiFetch(`/api/chatrooms/${actualRoomId}/read`, { method: 'PUT' })
          .then(refreshBadges)
          .catch(() => {});

      } catch (err) {
        alert(`チャットの読み込みに失敗しました: ${err.message}`);
        navigate(-1);
      }
    };

    setup();
    return () => { cancelled = true; };
  }, [productId, roomId, navigate, refreshBadges]);
  // roomIdが変わったとき（new→実IDへのnavigate後）に再実行される

  // 8秒ごとにポーリング（サーバー負荷とリアルタイム性のバランス値）
  useEffect(() => {
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer);
  }, [refresh]);

  // メッセージ件数が変わったときだけ発火
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages?.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText(''); // 楽観的UI: 先にクリアして「送信した感」を出す

    try {
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/messages`, {
        method: 'POST',
        body: { content: text },
      });
      await refresh();
    } catch (err) {
      alert(`送信に失敗しました: ${err.message}`);
      setInputText(text); // 失敗したら入力内容を戻す
    }
  };

  return { room, inputText, setInputText, handleSend, refresh, chatEndRef };
}
