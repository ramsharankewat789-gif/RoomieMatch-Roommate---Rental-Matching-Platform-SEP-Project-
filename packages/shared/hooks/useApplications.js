import { useState, useEffect, useContext } from "react";
import { mockApplications } from "../data/mockApplications";
import { NotificationContext } from "../context/NotificationContext";

export const useApplications = () => {
  const { addNotification } = useContext(NotificationContext);
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem("roomiematch_applications");
    return saved ? JSON.parse(saved) : mockApplications;
  });

  useEffect(() => {
    localStorage.setItem("roomiematch_applications", JSON.stringify(applications));
  }, [applications]);

  const applyForProperty = (tenantId, tenantName, propertyId, propertyTitle, ownerId, messageText) => {
    // Check if tenant already has a pending application for this property
    const existing = applications.find(a => a.propertyId === propertyId && a.tenantId === tenantId && a.status === "pending");
    if (existing) {
      return { success: false, message: "You already have a pending application for this property." };
    }

    const newApp = {
      id: "a_" + Date.now(),
      propertyId,
      tenantId,
      ownerId,
      status: "pending",
      appliedAt: new Date().toISOString(),
      message: messageText || "Hi, I am interested in renting this property.",
      history: [
        { status: "submitted", date: new Date().toISOString(), label: `Application submitted by ${tenantName}` }
      ]
    };

    setApplications(prev => [newApp, ...prev]);

    // Notify owner
    addNotification(
      ownerId,
      "New Application Received",
      `${tenantName} applied for your property: "${propertyTitle}"`,
      "application",
      newApp.id
    );

    return { success: true, application: newApp };
  };

  const updateApplicationStatus = (appId, newStatus, actorName) => {
    let tenantId = "";
    let propertyTitle = "your listing";

    setApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          tenantId = app.tenantId;
          const newHistory = [
            ...app.history,
            {
              status: newStatus,
              date: new Date().toISOString(),
              label: `Application status updated to ${newStatus} by ${actorName}`
            }
          ];

          return { ...app, status: newStatus, history: newHistory };
        }
        return app;
      })
    );

    // Notify tenant of update
    if (tenantId) {
      addNotification(
        tenantId,
        `Application ${newStatus.toUpperCase()}`,
        `Your application for property was ${newStatus} by the landlord.`,
        "application",
        appId
      );
    }
  };

  const cancelApplication = (appId, tenantName) => {
    let ownerId = "";
    setApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          ownerId = app.ownerId;
          return {
            ...app,
            status: "cancelled",
            history: [
              ...app.history,
              { status: "cancelled", date: new Date().toISOString(), label: "Application cancelled by tenant" }
            ]
          };
        }
        return app;
      })
    );

    if (ownerId) {
      addNotification(
        ownerId,
        "Application Cancelled",
        `${tenantName} has cancelled their application.`,
        "application",
        appId
      );
    }
  };

  return {
    applications,
    setApplications,
    applyForProperty,
    updateApplicationStatus,
    cancelApplication
  };
};
