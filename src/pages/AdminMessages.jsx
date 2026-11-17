import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, RefreshCw, Check, Clock, MessageSquare, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../lib/api.js";
import "./Admin.css";

export default function AdminMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/contact/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load messages.");
      }

      setMessages(result.data || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id, status) => {
    const token = sessionStorage.getItem("adminToken");

    try {
      const response = await fetch(
        `${API_BASE_URL}/contact/admin/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Status update failed.");
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );

      setSelected((current) =>
        current?.id === id ? { ...current, status } : current
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this message?"
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem("adminToken");

    try {
      const response = await fetch(
        `${API_BASE_URL}/contact/admin/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete message.");
      }

      setMessages((current) => current.filter((item) => item.id !== id));
      setSelected((current) => current?.id === id ? null : current);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main className="admin-messages-page">
<section className="admin-messages-content">
        <div className="admin-messages-title">
          <span className="admin-login-eyebrow">COMMUNICATION CENTER</span>
          <h1>Messages<span>.</span></h1>
          <p>Manage enquiries received through your portfolio.</p>
          <button className="admin-messages-refresh" onClick={fetchMessages}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="admin-messages-summary">
          <div><strong>{messages.length}</strong><span>Total messages</span></div>
          <div><strong>{messages.filter(m => m.status === "unread").length}</strong><span>Unread</span></div>
          <div><strong>{messages.filter(m => m.status === "replied").length}</strong><span>Replied</span></div>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <div className="admin-messages-layout">
          <section className="admin-message-list">
            <div className="admin-message-list-heading">
              <h2>Inbox</h2>
              <span>{messages.length} messages</span>
            </div>

            {loading ? (
              <p className="admin-message-empty">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="admin-message-empty">No messages received yet.</p>
            ) : (
              messages.map((message) => (
                <button
                  key={message.id}
                  className={`admin-message-item ${selected?.id === message.id ? "selected" : ""}`}
                  onClick={() => {
                    setSelected(message);
                    if (message.status === "unread") {
                      updateStatus(message.id, "read");
                    }
                  }}
                >
                  <div className="admin-message-item-top">
                    <strong>{message.name}</strong>
                    <span className={`admin-message-status ${message.status}`}>
                      {message.status}
                    </span>
                  </div>
                  <span className="admin-message-subject">
                    {message.subject || "No subject"}
                  </span>
                  <span className="admin-message-preview">
                    {message.message}
                  </span>
                  <small>{formatDate(message.created_at)}</small>
                </button>
              ))
            )}
          </section>

          <section className="admin-message-detail">
            {!selected ? (
              <div className="admin-message-placeholder">
                <MessageSquare size={35} />
                <strong>Select a message</strong>
                <span>Choose a message from your inbox to read it.</span>
              </div>
            ) : (
              <>
                <div className="admin-message-detail-top">
                  <div className="admin-message-detail-icon"><Mail size={21} /></div>
                  <div>
                    <h2>{selected.subject || "No subject"}</h2>
                    <span>Received {formatDate(selected.created_at)}</span>
                  </div>
                </div>

                <div className="admin-message-sender">
                  <strong>{selected.name}</strong>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                </div>

                <div className="admin-message-body">{selected.message}</div>

                <div className="admin-message-actions">
                  <a href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + (selected.subject || "Your enquiry"))}`}>
                    <Mail size={16} /> Reply via email
                  </a>

                  <button onClick={() => updateStatus(selected.id, "replied")}>
                    <Check size={16} /> Mark replied
                  </button>

                  <button onClick={() => updateStatus(selected.id, "unread")}>
                    <Clock size={16} /> Mark unread
                  </button>
                  <button className="admin-message-delete"
                    onClick={() => deleteMessage(selected.id)}>
                    <Trash2 size={16} /> Delete message
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}





