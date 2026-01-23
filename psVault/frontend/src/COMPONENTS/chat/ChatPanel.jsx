import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import apiClient from "../../utils/api/client.js";
import socket from "../../utils/socket.js";
import {
  ChatContainer,
  PanelHeader,
  IconButton,
  ChatMessages,
  LoadingContainer,
  Spinner,
  EmptyState,
  ChatMessage,
  ChatInputContainer,
  QuickActions,
  QuickActionButton,
  ChatInputForm,
} from "../../ui/style.jsx";
import {
  loadPrivateKey,
  importPublicKey,
  deriveSharedSecret,
  createAESKey,
  encryptAES,
  decryptAES,
} from "../../utils/crypto-utils.js";
import { getTimeAgo } from "../../utils/formatting/time.js";

function ChatPanel({ onClose, listing, currentUserEmail, currentUserName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [aesKey, setAesKey] = useState(null);

  const messagesEndRef = useRef(null);

  if (!listing || !listing.email) {
    return (
      <ChatContainer>
        <PanelHeader>
          <h3>Chat</h3>
          <IconButton onClick={onClose}>
            <X size={24} />
          </IconButton>
        </PanelHeader>

        <EmptyState>
          <MessageSquare size={48} />
          <p>Cannot load listing data.</p>
        </EmptyState>
      </ChatContainer>
    );
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      if (!conversation?.id) return;
      setLoading(true);

      const data = await apiClient.getMessages(conversation.id);

      const decrypted = await Promise.all(
        data.map(async (m) => ({
          ...m,
          text: await decryptAES(aesKey, m.message),
        }))
      );

      setMessages(decrypted);
    } catch (err) {
      console.error("[Chat] Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initConversation() {
      try {
        if (!listing || !currentUserEmail) return;

        const sellerEmail = listing.email;

        if (!sellerEmail) {
          console.log("Cannot chat with yourself.");
          return;
        }

        const conv = await apiClient.getOrCreateConversation(
          listing.listingId,
          sellerEmail
        );

        setConversation(conv);

        if (conv.id) {
          socket.emit("joinRoom", conv.id);
        }
      } catch (err) {
        console.error("[Chat] initConversation error:", err);
      }
    }

    initConversation();
  }, [listing, currentUserEmail]);

  useEffect(() => {
    async function setupEncryption() {
      try {
        if (!conversation?.id) return;

        const otherUserEmail = conversation.participants.find(
          (e) => e !== currentUserEmail
        );

        if (!otherUserEmail) {
          console.error("[Chat] No other user found in participants");
          return;
        }

        const privateKey = await loadPrivateKey();
        const { publicKey: otherUserPublicKey } =
          await apiClient.getUserPublicKey(otherUserEmail);

        const importedPub = await importPublicKey(otherUserPublicKey);
        const shared = await deriveSharedSecret(privateKey, importedPub);
        const aes = await createAESKey(shared);

        setAesKey(aes);
      } catch (err) {
        console.error("[Chat] setupEncryption error:", err);
      }
    }

    setupEncryption();
  }, [conversation?.id, currentUserEmail]);

  useEffect(() => {
    if (!aesKey || !conversation?.id) return;

    loadMessages();

    socket.emit("joinRoom", conversation.id);

    return () => {
      socket.emit("leaveConversation", conversation.id);
    };
  }, [aesKey, conversation?.id]);

  useEffect(() => {
    if (!conversation?.id || !aesKey) return;

    function handleIncomingMessage(msg) {
      if (msg.conversationId === conversation.id) {
        decryptAES(aesKey, msg.message).then((plain) => {
          setMessages((prev) => [...prev, { ...msg, text: plain }]);
        });
      }
    }

    socket.on("newMessage", handleIncomingMessage);

    return () => {
      socket.off("newMessage", handleIncomingMessage);
    };
  }, [conversation?.id, aesKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !aesKey || !conversation?.id) return;

    try {
      const cipher = await encryptAES(aesKey, newMessage);

      await apiClient.sendMessage(conversation.id, cipher);
      setNewMessage("");
    } catch (err) {
      console.error("[Chat] Error sending message:", err);
    }
  };

  const sendQuickMessage = async (text) => {
    if (!aesKey || !conversation?.id) return;

    try {
      const cipher = await encryptAES(aesKey, text);

      await apiClient.sendMessage(conversation.id, cipher);
    } catch (err) {
      console.error("[Chat] Error sending quick message:", err);
    }
  };

  return (
    <ChatContainer>
      <PanelHeader>
        <div>
          <h3>{listing.title}</h3>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
            ${listing.price} • {listing.platform}
          </p>
        </div>

        <IconButton onClick={onClose}>
          <X size={24} />
        </IconButton>
      </PanelHeader>

      <ChatMessages>
        {loading ? (
          <LoadingContainer>
            <Spinner />
            <span>Loading messages...</span>
          </LoadingContainer>
        ) : messages.length === 0 ? (
          <EmptyState>
            <MessageSquare size={48} />
            <p>No messages yet. Start the conversation!</p>
          </EmptyState>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id || msg._id || msg.createdAt}
              $isOwn={msg.senderEmail === currentUserEmail}
            >
              <div className="sender">
                {msg.senderEmail === currentUserEmail
                  ? currentUserName || "You"
                  : msg.senderEmail}
              </div>
              <div className="bubble">{msg.text}</div>
              <div className="time">{getTimeAgo(msg.createdAt)}</div>
            </ChatMessage>
          ))
        )}
        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInputContainer>
        <QuickActions>
          <QuickActionButton
            onClick={() => sendQuickMessage("Is this still available?")}
          >
            Is this still available?
          </QuickActionButton>

          <QuickActionButton
            onClick={() =>
              sendQuickMessage(
                "Can you do $" + (listing.price * 0.9).toFixed(2) + "?"
              )
            }
          >
            Can you negotiate?
          </QuickActionButton>

          <QuickActionButton
            onClick={() => sendQuickMessage("Where are you located?")}
          >
            Where are you located?
          </QuickActionButton>
        </QuickActions>

        <ChatInputForm onSubmit={handleSend}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" disabled={!newMessage.trim()}>
            <Send size={20} />
          </button>
        </ChatInputForm>
      </ChatInputContainer>
    </ChatContainer>
  );
}

export default ChatPanel;
