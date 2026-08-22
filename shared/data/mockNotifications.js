export const mockNotifications = [
  {
    id: "n1",
    userId: "u1", // Alex Mercer
    title: "New Message",
    message: "Sarah Jenkins sent you a message regarding University Gardens Apartment.",
    type: "message", // message, application, verification, general
    referenceId: "m1",
    isRead: false,
    createdAt: "2026-08-15T11:30:00Z"
  },
  {
    id: "n2",
    userId: "u1", // Alex Mercer
    title: "Student Verification Approved",
    message: "Congratulations! Your student ID verification has been approved. You are now a Verified Student.",
    type: "verification",
    referenceId: "u1",
    isRead: true,
    createdAt: "2026-08-10T12:00:00Z"
  },
  {
    id: "n3",
    userId: "u2", // Sarah Jenkins (Owner)
    title: "New Application Received",
    message: "Alex Mercer has submitted an application for University Gardens Apartment.",
    type: "application",
    referenceId: "a1",
    isRead: false,
    createdAt: "2026-08-15T11:00:00Z"
  },
  {
    id: "n4",
    userId: "u3", // Admin
    title: "New Verification Request",
    message: "Chloe Henderson submitted a student verification request.",
    type: "verification",
    referenceId: "u5",
    isRead: false,
    createdAt: "2026-08-18T16:45:00Z"
  }
];
