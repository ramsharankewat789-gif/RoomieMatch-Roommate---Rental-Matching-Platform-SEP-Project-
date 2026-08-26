/**
 * Notifications.jsx
 *
 * Reads from NotificationContext which pulls from real API.
 * Field names: is_read (not isRead), created_at (not createdAt),
 * reference_id (not referenceId). Routes use /user/ prefix.
 */
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "@shared/context/NotificationContext";
import Button from "@shared/components/common/Button";
import EmptyState from "@shared/components/common/EmptyState";

export const Notifications = () => {
  const { userNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useContext(NotificationContext);
  const navigate = useNavigate();

  const handleNotificationClick = (notif) => {
    // Mark as read using snake_case field
    if (!notif.is_read) markAsRead(notif.id);

    // Navigate to associated resource using correct /user/ routes
    if (notif.type === "message" && notif.reference_id) {
      navigate(`/user/messages?thread=${notif.reference_id}`);
    } else if (notif.type === "application" && notif.reference_id) {
      navigate("/user/applications");
    } else if (notif.type === "verification") {
      navigate("/user/verification");
    }
  };

  const unreadCount = userNotifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Notifications</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            System updates, message receipts, and application approvals
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="px-4 py-2">
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {userNotifications.length === 0 ? (
        <EmptyState
          icon="notifications_off"
          title="All caught up!"
          description="You have no notifications at the moment. We will notify you when things happen."
        />
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant/60 shadow-sm">
          {userNotifications.map((notif) => {
            const isUnread = !notif.is_read;
            const createdAt = notif.created_at;

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 flex justify-between gap-4 cursor-pointer hover:bg-surface-container-low transition-colors select-none ${
                  isUnread ? "bg-primary-container/5 border-l-4 border-primary" : ""
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                    notif.type === "message"
                      ? "bg-primary/10 text-primary"
                      : notif.type === "application"
                      ? "bg-secondary-container text-on-secondary-container"
                      : notif.type === "verification"
                      ? "bg-tertiary/10 text-tertiary"
                      : "bg-surface-container-high text-on-surface"
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {notif.type === "message"      ? "chat"
                      : notif.type === "application" ? "description"
                      : notif.type === "verification" ? "verified"
                      : "notifications"}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className={`font-label-md text-label-md text-on-surface ${isUnread ? "font-bold" : ""}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] text-outline font-medium shrink-0">
                        {createdAt
                          ? `${new Date(createdAt).toLocaleDateString()} · ${new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
                      </span>
                    </div>
                    <p className="text-body-md text-on-surface-variant leading-relaxed">
                      {notif.message}
                    </p>
                    {isUnread && (
                      <span className="inline-block w-2 h-2 rounded-full bg-primary mt-0.5" />
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="text-outline hover:text-error transition-colors p-1.5 self-center shrink-0"
                  title="Delete notification"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
