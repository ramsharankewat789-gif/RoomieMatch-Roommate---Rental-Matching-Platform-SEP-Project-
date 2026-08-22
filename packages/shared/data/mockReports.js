export const mockReports = [
  {
    id: "rep1",
    reporterId: "u1", // Alex Mercer
    reportedUserId: "u5", // Chloe Henderson (just for testing admin report interface)
    reportedPropertyId: null,
    title: "Suspicious User Profile",
    reason: "Profile pictures seem fake/stolen from an online stock database. User is unresponsive to questions about their university enrollment status.",
    status: "pending", // pending, resolved, dismissed
    createdAt: "2026-08-18T18:00:00Z",
    resolution: null
  },
  {
    id: "rep2",
    reporterId: "u4", // Marcus Brody
    reportedUserId: null,
    reportedPropertyId: "p3", // Cozy Studio near Library
    title: "Inaccurate Listing Information",
    reason: "Listing states that cats are allowed with deposit, but landlord explicitly messaged me stating that pets are strictly forbidden. Address is also slightly off.",
    status: "resolved",
    createdAt: "2026-08-14T09:12:00Z",
    resolution: "Owner contacted, property listing updated to reflect 'No Pets' rule and correct suite number."
  }
];
