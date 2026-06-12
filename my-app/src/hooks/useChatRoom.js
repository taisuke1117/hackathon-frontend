import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

/**
 * チャットルームの共通ロジック。
 * - ルーム読み込み（roomId='new'なら作成してURL差し替え）
 * - 8秒ポーリング
 * - メッセージ送信
 * - 既読化
 */
export function useChatRoom(productId, roomId) {
  const navigate = useNavigate();
  const { refreshBadges } = useAuth();
  const chatEndRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [inputText, setInputText] = useState('');

  const refresh = useCallback(async () => {
    if (roomId === 'new') return;
    try {
      const detail = await apiFetch(`/api/chatrooms/${roomId}`);
      setRoom(detail);
    } catch { /* 一時的な失敗は無視 */ }
  }, [roomId]);

  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      try {
        let actualRoomId = roomId;
        if (roomId === 'new') {
          const res = await apiFetch('/api/chatrooms', {
            method: 'POST',
            body: { product_id: Number(productId) },
          });
          actualRoomId = res.chatroom_id;
          navigate(`/chat/${productId}/${actualRoomId}`, { replace: true });
          return;
        }
        const detail = await apiFetch(`/api/chatrooms/${actualRoomId}`);
        if (!cancelled) setRoom(detail);
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

  useEffect(() => {
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages?.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    try {
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/messages`, {
        method: 'POST',
        body: { content: text },
      });
      await refresh();
    } catch (err) {
      alert(`送信に失敗しました: ${err.message}`);
      setInputText(text);
    }
  };

  return { room, inputText, setInputText, handleSend, refresh, chatEndRef };
}
