import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "@shared/context/NotificationContext";
import Button from "@shared/components/common/Button";
import EmptyState from "@shared/components/common/EmptyState";

export const AdminNotifications = () => {
  const { userNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useContext(NotificationContext);
  const navigate = useNavigate();

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    if (notif.type === "verification") {
      navigate("/admin/verifications");
    } else if (notif.type === "general" && notif.message.toLowerCase().includes("report")) {
      navigate("/admin/reports");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Admin Notifications</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            System logs, registration alerts, and compliance reports
          </p>
        </div>
        {userNotifications.length > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="px-4 py-2">
            Mark all as read
          </Button>
        )}
      </div>

      {userNotifications.length === 0 ? (
        <EmptyState
          icon="notifications_off"
          title="No admin alerts"
          description="All processes are running smoothly. You have no pending system notifications."
        />
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant/60 shadow-sm">
          {userNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-5 flex justify-between gap-4 cursor-pointer hover:bg-surface-container-low transition-colors select-none ${
                !notif.isRead ? "bg-primary-container/5 border-l-4 border-primary" : ""
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    {notif.type === "verification" ? "verified" : "flag"}
                  </span>
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-label-md text-label-md text-on-surface font-bold">
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-outline font-semibold">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.id);
                }}
                className="text-outline hover:text-error transition-colors p-1.5 self-center shrink-0"
                title="Delete Log"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
