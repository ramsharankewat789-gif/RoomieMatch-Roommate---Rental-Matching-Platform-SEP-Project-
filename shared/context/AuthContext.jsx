import React, { createContext, useState, useEffect } from "react";
import { mockUsers } from "../data/mockUsers";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("roomiematch_users");
    return savedUsers ? JSON.parse(savedUsers) : mockUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("roomiematch_currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem("roomiematch_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("roomiematch_currentUser", JSON.stringify(currentUser));
      setUsers(prevUsers =>
        prevUsers.map(u => u.id === currentUser.id ? currentUser : u)
      );
    } else {
      localStorage.removeItem("roomiematch_currentUser");
    }
  }, [currentUser]);

  const login = (email, password) => {
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: "Invalid email or password" };
  };

  const register = (userData) => {
    const exists = users.some(
      u => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (exists) {
      return { success: false, message: "Email already registered" };
    }

    const newUser = {
      id: "u_" + Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: "user",                   // every new registration is a plain "user"
      isVerified: false,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWbdkxUHzMNpHlhuEepdA0D8yV5Y0ET3mafJo0chhMbHmTLBoiW0Pv8Jz3GMbVlguA5X_VHSw5p0z7ZYAi11sfmwGMj1oJWct2qmaJJ0qxuOVFvnfivqzqvZHF2ny6faw7z3oqOozqkfABXrnOLFq2Gt1u5QpgF8aHphhC124Rf7vcqrbGGDuXukJi0hCuZKlHmWUSU872r5cBWkqKoSxYcjs1NClclPKyaFKLPQ5RyUMAFtSthKLR",
      phone: userData.phone || "",
      university: userData.university || "",
      major: userData.major || "",
      age: userData.age || 20,
      gender: userData.gender || "Other",
      budget: userData.budget || "$500 - $1,000",
      bio: userData.bio || "No biography provided yet.",
      preferences: {
        smoke: userData.smoke || "No",
        pet: userData.pet || "No Pets",
        clean: userData.clean || "Medium",
        sleep: userData.sleep || "Early Bird",
        social: userData.social || "Medium",
        cooking: userData.cooking || "Sometimes"
      },
      hobbies: userData.hobbies || [],
      properties: [],                 // every user can list properties
      verificationDoc: {
        status: "Unverified",
        type: "ID Document",
        submittedAt: null
      }
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (updatedFields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);
  };

  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, users, login, register, logout, updateProfile, switchUser, setUsers }}
    >
      {children}
    </AuthContext.Provider>
  );
};
