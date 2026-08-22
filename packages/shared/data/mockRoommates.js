export const mockRoommates = [
  {
    userId: "u4",
    compatibilityScore: 92,
    breakdown: {
      cleanliness: 85,
      sleepSchedule: 90,
      socialLife: 95,
      hobbiesSharing: 98
    },
    matchingPreferences: [
      { category: "Cleanliness", match: true, label: "Both prefer moderate cleanliness" },
      { category: "Schedule", match: true, label: "Active during standard hours" },
      { category: "Social", match: true, label: "Both are moderately social" }
    ],
    mismatchPreferences: []
  },
  {
    userId: "u5",
    compatibilityScore: 78,
    breakdown: {
      cleanliness: 95,
      sleepSchedule: 60,
      socialLife: 80,
      hobbiesSharing: 77
    },
    matchingPreferences: [
      { category: "Cleanliness", match: true, label: "Both prefer extremely tidy spaces" }
    ],
    mismatchPreferences: [
      { category: "Schedule", match: false, label: "Early Bird vs Night Owl schedule conflict" }
    ]
  }
];
