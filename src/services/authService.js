import { isFirebaseConfigured, auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Helper to validate email, password, and phone number
export const validateInput = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  password: (password) => {
    // Min 6 characters, at least one letter and one number
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return re.test(password);
  },
  phone: (phone) => {
    // 10 digits mobile number validation
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
  }
};

// -------------------------------------------------------------
// LOCALSTORAGE MOCK AUTH SYSTEM (Fallback)
// -------------------------------------------------------------
const getMockUsers = () => JSON.parse(localStorage.getItem('littu_mock_users') || '[]');
const saveMockUsers = (users) => localStorage.setItem('littu_mock_users', JSON.stringify(users));

const getMockCurrentUser = () => JSON.parse(localStorage.getItem('littu_mock_current_user') || 'null');
const saveMockCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('littu_mock_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('littu_mock_current_user');
  }
};

const listeners = new Set();
const triggerListeners = (user) => {
  listeners.forEach(cb => cb(user));
};

// -------------------------------------------------------------
// EXPORTED AUTH SERVICE
// -------------------------------------------------------------
export const authService = {
  // 1. Register User
  register: async (name, phone, email, password) => {
    if (!name.trim()) throw new Error("Full Name is required");
    if (!validateInput.phone(phone)) throw new Error("Please enter a valid 10-digit mobile number starting with 6-9");
    if (!validateInput.email(email)) throw new Error("Please enter a valid email address");
    if (!validateInput.password(password)) throw new Error("Password must be at least 6 characters long and contain both letters and numbers");

    if (isFirebaseConfigured) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save details to Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name,
        phone,
        email,
        createdAt: new Date().toISOString()
      });
      return { uid: user.uid, name, phone, email, emailVerified: user.emailVerified };
    } else {
      const users = getMockUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email is already registered.");
      }
      
      const newUser = {
        uid: 'mock_uid_' + Math.random().toString(36).substr(2, 9),
        name,
        phone,
        email,
        emailVerified: false, // will require mock verification
        createdAt: new Date().toISOString(),
        password // Stored only for mock verification on login
      };
      
      users.push(newUser);
      saveMockUsers(users);
      
      // Automatically log them in as a half-verified user
      saveMockCurrentUser(newUser);
      triggerListeners(newUser);
      
      return newUser;
    }
  },

  // 2. Login User
  login: async (email, password, rememberMe = false) => {
    if (!validateInput.email(email)) throw new Error("Please enter a valid email address");
    if (!password) throw new Error("Password is required");

    if (isFirebaseConfigured) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Retrieve details from Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        ...userData
      };
    } else {
      const users = getMockUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (!user) {
        throw new Error("Invalid email or password.");
      }
      
      const cleanUser = { ...user };
      delete cleanUser.password; // Don't expose password
      
      saveMockCurrentUser(cleanUser);
      triggerListeners(cleanUser);
      return cleanUser;
    }
  },

  // 3. Logout User
  logout: async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    } else {
      saveMockCurrentUser(null);
      triggerListeners(null);
    }
  },

  // 4. Send Forgot Password Reset
  forgotPassword: async (email) => {
    if (!validateInput.email(email)) throw new Error("Please enter a valid email address");
    
    if (isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
    } else {
      const users = getMockUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error("No user registered with this email.");
      }
      // Just simulate success
      console.log(`Mock reset password email sent to ${email}`);
    }
  },

  // 5. Update Profile Details
  updateProfile: async (uid, name, phone) => {
    if (!name.trim()) throw new Error("Full Name is required");
    if (!validateInput.phone(phone)) throw new Error("Please enter a valid 10-digit mobile number");

    if (isFirebaseConfigured) {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { name, phone });
      return { name, phone };
    } else {
      const users = getMockUsers();
      const userIdx = users.findIndex(u => u.uid === uid);
      if (userIdx === -1) throw new Error("User profile not found.");
      
      users[userIdx].name = name;
      users[userIdx].phone = phone;
      saveMockUsers(users);
      
      const currentUser = getMockCurrentUser();
      if (currentUser && currentUser.uid === uid) {
        const updatedUser = { ...currentUser, name, phone };
        saveMockCurrentUser(updatedUser);
        triggerListeners(updatedUser);
      }
      return { name, phone };
    }
  },

  // 6. Change Password
  changePassword: async (currentPassword, newPassword) => {
    if (!newPassword || !validateInput.password(newPassword)) {
      throw new Error("New password must be at least 6 characters long and contain both letters and numbers.");
    }

    if (isFirebaseConfigured) {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      // Reauthenticate user first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } else {
      const currentUser = getMockCurrentUser();
      if (!currentUser) throw new Error("User not authenticated");
      
      const users = getMockUsers();
      const userIdx = users.findIndex(u => u.uid === currentUser.uid);
      if (userIdx === -1) throw new Error("User not found");
      
      if (users[userIdx].password !== currentPassword) {
        throw new Error("Current password is incorrect");
      }
      
      users[userIdx].password = newPassword;
      saveMockUsers(users);
    }
  },

  // 7. Simulating Email Verification (For mock mode)
  verifyEmailMock: async (uid) => {
    if (isFirebaseConfigured) {
      // Real firebase auth sends a link, but we can't force verification from client.
      // So we return current auth verification status.
      return auth.currentUser?.emailVerified || false;
    } else {
      const users = getMockUsers();
      const userIdx = users.findIndex(u => u.uid === uid);
      if (userIdx !== -1) {
        users[userIdx].emailVerified = true;
        saveMockUsers(users);
        
        const currentUser = getMockCurrentUser();
        if (currentUser && currentUser.uid === uid) {
          const updatedUser = { ...currentUser, emailVerified: true };
          saveMockCurrentUser(updatedUser);
          triggerListeners(updatedUser);
        }
      }
      return true;
    }
  },

  // 8. Auth State Change Listener
  onAuthStateChanged: (callback) => {
    if (isFirebaseConfigured) {
      return auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.exists() ? userDoc.data() : {};
            callback({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              ...userData
            });
          } catch (e) {
            console.error("Error fetching user doc from Firestore:", e);
            callback({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified
            });
          }
        } else {
          callback(null);
        }
      });
    } else {
      listeners.add(callback);
      // Trigger immediately with current user
      callback(getMockCurrentUser());
      return () => {
        listeners.delete(callback);
      };
    }
  }
};
