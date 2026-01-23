import {
  generateECDHKeyPair,
  exportPublicKey,
  savePrivateKey,
  loadPrivateKey,
} from "../crypto-utils.js";

import socket from "../socket.js";

const API_BASE_URL =
  typeof window !== "undefined" && window.ENV_API_URL
    ? window.ENV_API_URL
    : "http://localhost:3001/api";

class ApiClient {
  constructor() {
    this.token = null;
    this.loadToken();
  }

  loadToken() {
    if (typeof window !== "undefined") {
      this.token = window.localStorage.getItem("psvault-auth-token");
    }
  }

  saveToken(token) {
    this.token = token;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("psvault-auth-token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("psvault-auth-token");
      window.localStorage.removeItem("psvault-user");
    }
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const isFormData = options.body instanceof FormData;

    const headers = {
      ...this.getHeaders(),
      ...options.headers,
    };

    if (isFormData) {
      delete headers["Content-Type"];
    }

    const config = {
      ...options,
      headers,
    };

    console.log("API Request:", url, "METHOD=", config.method, config);

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getUserPublicKey(email) {
    return this.request(`/user/publicKey/${encodeURIComponent(email)}`);
  }

  async signUp(email, password, name) {
    const keyPair = await generateECDHKeyPair();
    const publicKey = await exportPublicKey(keyPair.publicKey);
    await savePrivateKey(keyPair.privateKey);

    const data = await this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name, publicKey }),
    });

    if (data.token) {
      this.saveToken(data.token);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("psvault-user", JSON.stringify(data.user));
      }
    }

    return data;
  }

  async signIn(email, password) {
    const data = await this.request("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      this.saveToken(data.token);

      if (typeof window !== "undefined") {
        window.localStorage.setItem("psvault-user", JSON.stringify(data.user));
        window.localStorage.setItem("psvault-auth-token", data.token);
      }

      socket.auth = { token: data.token };
      socket.connect();
    }

    let privateKey = await loadPrivateKey();

    if (!privateKey) {
      console.warn("No private key found — generating new one...");

      const keyPair = await generateECDHKeyPair();
      await savePrivateKey(keyPair.privateKey);

      const exportedPublic = await exportPublicKey(keyPair.publicKey);

      await this.request("/user/updatePublicKey", {
        method: "POST",
        body: JSON.stringify({ publicKey: exportedPublic }),
      });
    }

    return data;
  }

  async signOut() {
    this.clearToken();
    socket.disconnect();
    return { success: true };
  }

  getCurrentUser() {
    if (typeof window !== "undefined") {
      const data = window.localStorage.getItem("psvault-user");
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  }

  async getListings() {
    return this.request("/listings");
  }

  async createListing(listingData) {
    return this.request("/listings", {
      method: "POST",
      body: JSON.stringify(listingData),
    });
  }

  async getListingById(listingId) {
    return this.request(`/listings/${listingId}`);
  }

  async updateListing(listingId, updates) {
    return this.request(`/listings/${listingId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteListing(listingId) {
    return this.request(`/listings/${listingId}`, {
      method: "DELETE",
    });
  }

  async markListingAsSold(listingId) {
    return this.updateListing(listingId, { isSold: true });
  }

  async verifyListing(title, description, images) {
    return this.request("/verify", {
      method: "POST",
      body: JSON.stringify({ title, description, images }),
    });
  }

  async getConversations() {
    return this.request("/conversations");
  }

  async getOrCreateConversation(listingId, sellerEmail) {
    return this.request("/conversations", {
      method: "POST",
      body: JSON.stringify({ listingId, sellerEmail }),
    });
  }

  async getMessages(conversationId) {
    return this.request(`/messages/${conversationId}`);
  }

  async sendMessage(conversationId, message) {
    return this.request("/messages", {
      method: "POST",
      body: JSON.stringify({ conversationId, message }),
    });
  }

  async uploadImages(filesArray) {
    const formData = new FormData();
    filesArray.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  }

  async markConversationRead(conversationId) {
    return this.request("/conversations/mark-read", {
      method: "POST",
      body: JSON.stringify({ conversationId }),
    });
  }

  async createPendingListing(listingData) {
    return this.request("/listings/pending", {
      method: "POST",
      body: JSON.stringify(listingData),
    });
  }

  async getPendingStatus(listingId) {
    return this.request(`/listings/pending/${listingId}`);
  }
}

const apiClient = new ApiClient();

export default apiClient;
