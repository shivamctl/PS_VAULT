import { useState, useEffect } from "react";
import { MessageSquare, Clock, X } from "lucide-react";
import apiClient from "../../utils/api/client.js";
import socket from "../../utils/socket.js";
import {
  PanelContainer,
  PanelHeader,
  IconButton,
  PanelContent,
  LoadingContainer,
  Spinner,
  EmptyState,
  ListingsList,
  ListingItem,
} from "../../ui/style.jsx";
import { getTimeAgo } from "../../utils/formatting/time.js";
import { sanitizeEmail } from "../../utils/formatting/sanitizeEmail.js";

function MessagesPanel({ onClose, email, onChatOpen, setHasUnread }) {
  const userEmail = email;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      const data = await apiClient.getConversations();

      const sorted = data.sort(
        (a, b) =>
          new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
      );

      setConversations(sorted);

      sorted.forEach((conv) => {
        if (conv.id) socket.emit("joinRoom", conv.id);
      });

      const unreadExists = sorted.some(
        (conv) => conv.unread && conv.unread[sanitizeEmail(userEmail)] > 0
      );

      setHasUnread(unreadExists);
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const getOtherUser = (participants) =>
    participants.find((p) => p !== userEmail);

  const handleConversationClick = async (conv) => {
    try {
      await apiClient.markConversationRead(conv.id);

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === conv.id
            ? {
                ...c,
                unread: {
                  ...(c.unread || {}),
                  [sanitizeEmail(userEmail)]: 0,
                },
              }
            : c
        );

        const anyUnread = updated.some(
          (c) => c.unread && c.unread[sanitizeEmail(userEmail)] > 0
        );

        setHasUnread(anyUnread);

        return updated;
      });

      if (!conv.listing || conv.listing.title === "Listing Removed") {
        alert("This listing was removed by the seller.");
        return;
      }
      onChatOpen(conv.listingId);
    } catch (err) {
      console.error("Failed to open conversation:", err);
    }
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <h3>Messages</h3>
        <IconButton onClick={onClose}>
          <X size={24} />
        </IconButton>
      </PanelHeader>

      <PanelContent>
        {loading ? (
          <LoadingContainer>
            <div>
              <Spinner />
              <span>Loading messages...</span>
            </div>
          </LoadingContainer>
        ) : conversations.length === 0 ? (
          <EmptyState>
            <MessageSquare size={48} />
            <p>No conversations yet</p>
          </EmptyState>
        ) : (
          <ListingsList>
            {conversations.map((conv) => {
              const isUnread =
                conv.unread && conv.unread[sanitizeEmail(userEmail)] > 0;

              const removed =
                conv.listing?.title?.toLowerCase() === "listing removed";

              return (
                <ListingItem
                  key={conv.id}
                  onClick={() => handleConversationClick(conv)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="header">
                    <h4 style={removed ? { color: "red" } : {}}>
                      {conv.listing.title}
                    </h4>

                    {isUnread && (
                      <span
                        style={{
                          marginLeft: "8px",
                          width: "8px",
                          height: "8px",
                          borderRadius: "999px",
                          background: "#00d9ff",
                          display: "inline-block",
                        }}
                      />
                    )}
                  </div>

                  <div className="info">
                    <span>User: {getOtherUser(conv.participants)}</span>
                  </div>

                  <div className="time">
                    <Clock size={12} />
                    <span>
                      {conv.lastMessageAt
                        ? getTimeAgo(conv.lastMessageAt)
                        : "No messages"}
                    </span>
                  </div>

                  {isUnread && (
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        background: "#00d9ff",
                        borderRadius: "50%",
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                      }}
                    />
                  )}
                </ListingItem>
              );
            })}
          </ListingsList>
        )}
      </PanelContent>
    </PanelContainer>
  );
}

export default MessagesPanel;
