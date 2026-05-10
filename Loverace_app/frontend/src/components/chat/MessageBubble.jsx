import { formatDistanceToNow } from '../../utils/time';

export default function MessageBubble({ message, isMe }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed ${isMe ? 'bubble-me' : 'bubble-them'}`}>
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-400 text-left'}`}>
          {formatDistanceToNow(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
