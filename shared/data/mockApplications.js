export const mockApplications = [
  {
    id: "a1",
    propertyId: "p1",
    tenantId: "u1", // Alex Mercer
    ownerId: "u2", // Sarah Jenkins
    status: "pending", // pending, approved, rejected, cancelled
    appliedAt: "2026-08-15T11:00:00Z",
    message: "Hi Sarah, I am a Computer Science junior at State University. I am very interested in this room since it is so close to campus. I am quiet, clean, and always pay rent on time. Let me know if we can arrange a viewing!",
    history: [
      { status: "submitted", date: "2026-08-15T11:00:00Z", label: "Application submitted by Alex Mercer" }
    ]
  },
  {
    id: "a2",
    propertyId: "p2",
    tenantId: "u4", // Marcus Brody
    ownerId: "u2",
    status: "approved",
    appliedAt: "2026-08-12T09:00:00Z",
    message: "Hello Mrs. Jenkins, I am interested in renting a room in the Townhouse. I have a clean credit record and a stable co-signer.",
    history: [
      { status: "submitted", date: "2026-08-12T09:00:00Z", label: "Application submitted by Marcus Brody" },
      { status: "reviewed", date: "2026-08-13T10:00:00Z", label: "Application put under review" },
      { status: "approved", date: "2026-08-14T08:30:00Z", label: "Application approved by landlord" }
    ]
  }
];
