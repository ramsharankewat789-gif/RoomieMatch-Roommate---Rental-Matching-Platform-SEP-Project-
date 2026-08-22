export const mockMessages = [
  {
    id: "m1",
    participants: ["u1", "u2"], // Alex and Sarah (Owner)
    propertyId: "p1", // Discussion about University Gardens
    messages: [
      {
        id: "msg1_1",
        senderId: "u1",
        text: "Hello! Is the room in University Gardens Apartment still available for September?",
        timestamp: "2026-08-15T11:05:00Z",
        isRead: true
      },
      {
        id: "msg1_2",
        senderId: "u2",
        text: "Yes, it is! I've received a couple of applications but haven't made a final decision yet. Have you submitted your application?",
        timestamp: "2026-08-15T11:15:00Z",
        isRead: true
      },
      {
        id: "msg1_3",
        senderId: "u1",
        text: "Yes, I just did! I'm a student at State Uni, clean and quiet. Let me know if you need any references.",
        timestamp: "2026-08-15T11:20:00Z",
        isRead: true
      },
      {
        id: "msg1_4",
        senderId: "u2",
        text: "Perfect, thank you Alex! I'll review it and get back to you by tomorrow. Would you like to schedule a virtual tour?",
        timestamp: "2026-08-15T11:30:00Z",
        isRead: false
      }
    ]
  },
  {
    id: "m2",
    participants: ["u1", "u4"], // Alex and Marcus (Potential Roommate)
    messages: [
      {
        id: "msg2_1",
        senderId: "u4",
        text: "Hey Alex! I saw we matched with a 92% compatibility score. Are you looking to team up for a place near campus?",
        timestamp: "2026-08-16T14:00:00Z",
        isRead: true
      },
      {
        id: "msg2_2",
        senderId: "u1",
        text: "Hey Marcus! Yeah, absolutely. I'm currently looking at a 2-bedroom at University Gardens. It's $950/month total, so $475 each. Super close to CS department.",
        timestamp: "2026-08-16T14:15:00Z",
        isRead: true
      },
      {
        id: "msg2_3",
        senderId: "u4",
        text: "Oh, that sounds perfect! That's well within my budget. Do you know if there is parking? I have a car.",
        timestamp: "2026-08-16T14:22:00Z",
        isRead: true
      },
      {
        id: "msg2_4",
        senderId: "u1",
        text: "Yes, the listing says parking spot is available. Let's apply together!",
        timestamp: "2026-08-16T14:30:00Z",
        isRead: true
      }
    ]
  }
];
