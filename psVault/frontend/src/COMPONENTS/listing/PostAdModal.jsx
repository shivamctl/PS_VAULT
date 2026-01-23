import { useState, useEffect, useRef } from "react";
import { X, ImagePlus } from "lucide-react";
import apiClient from "../../utils/api/client.js";
import socket from "../../utils/socket.js";
import { connectSocket } from "../../utils/socket.js";

import {
  ModalOverlay,
  Modal,
  CloseButton,
  ModalHeader,
  Form,
  FormGroup,
  Input,
  TextArea,
  Select,
  ImagesGrid,
  ImageItem,
  RemoveImageButton,
  FileInput,
  FileInputLabel,
  VerificationStatus,
  PrimaryButton,
} from "../../ui/style.jsx";

function PostAdModal({ isOpen, onClose, accessToken, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Brand New");
  const [platform, setPlatform] = useState("PS5");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const fileInputRef = useRef(null);
  const [listingId, setListingId] = useState(null);
  const listingIdRef = useRef(null);

  useEffect(() => {
    listingIdRef.current = listingId;
  }, [listingId]);

  const resetForm = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));

    setTitle("");
    setDescription("");
    setPrice("");
    setCondition("Brand New");
    setPlatform("PS5");
    setImages([]);
    setVerificationStatus(null);
    setVerificationMessage("");
    setLoading(false);
    setListingId(null);
  };

  useEffect(() => {
    const handleStatus = (data) => {
      console.log("SOCKET EVENT:", data);

      if (String(data.listingId) !== String(listingIdRef.current)) return;

      const status = (data.status || "").toLowerCase();

      if (status === "retrying") {
        setVerificationStatus("verifying");
        setVerificationMessage(data.reason || "Retrying verification...");
        return;
      }

      if (status === "approved") {
        setVerificationStatus("success");
        setVerificationMessage("Listing approved & published!");
        setLoading(false);

        setTimeout(() => {
          resetForm();
          onClose();
          onSuccess();
        }, 1000);
        return;
      }

      if (status === "rejected") {
        setVerificationStatus("error");
        setVerificationMessage(data.reason || "Listing rejected");
        setLoading(false);
        return;
      }
    };

    socket.on("listingStatus", handleStatus);
    return () => socket.off("listingStatus", handleStatus);
  }, [onClose, onSuccess]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed");
        return;
      }
    }
    if (images.length + files.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }

    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (images.length === 0) {
      setVerificationStatus("error");
      setVerificationMessage("Please upload at least one image");
      return;
    }

    setLoading(true);
    setVerificationStatus("verifying");
    setVerificationMessage("Uploading images...");

    try {
      const uploadRes = await apiClient.uploadImages(
        images.map((img) => img.file),
        accessToken,
      );

      const imageUrls = uploadRes.urls;

      setVerificationMessage("Sending for AI verification...");
      const user = apiClient.getCurrentUser();
      if (!user || !user.email) {
        throw new Error("User not found in local storage");
      }
      const email = user.email;

      const pending = await apiClient.createPendingListing({
        email,
        title,
        description,
        price,
        condition,
        platform,
        imageUrls,
      });

      setListingId(pending.listingId);
      connectSocket();
      listingIdRef.current = pending.listingId;
      connectSocket();

      listingIdRef.current = pending.listingId;

      if (socket.connected) {
        socket.emit("joinPendingRoom", `pending-${pending.listingId}`);
      } else {
        socket.once("connect", () => {
          socket.emit("joinPendingRoom", `pending-${pending.listingId}`);
        });
      }

      setVerificationStatus("verifying");
      setVerificationMessage("AI is verifying your listing...");
    } catch (err) {
      console.log("ERR RESPONSE:", err?.response?.data);
      console.log("ERR STATUS:", err?.response?.status);

      console.error("POST LISTING ERROR:", err);

      setLoading(false);
      setVerificationStatus("error");
      setVerificationMessage(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to verify listing",
      );
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <Modal $maxWidth="600px" onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>

        <ModalHeader>
          <h2>Post a Game</h2>
          <p>AI will verify your listing before publishing</p>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Game Title *</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., God of War Ragnarök"
              required
            />
          </FormGroup>

          <FormGroup>
            <label>Description *</label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the game condition, any extras included, etc."
              required
            />
          </FormGroup>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <FormGroup>
              <label>Price (USD) *</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
                step="0.01"
                min="0"
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Platform *</label>
              <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
              >
                <option value="PS5">PS5</option>
                <option value="PS4">PS4</option>
              </Select>
            </FormGroup>
          </div>

          <FormGroup>
            <label>Condition *</label>
            <Select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
            >
              <option value="Brand New">Brand New</option>
              <option value="Like New">Like New</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Acceptable">Acceptable</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <label>Images (Max 3)</label>
            {images.length > 0 && (
              <ImagesGrid>
                {images.map((img, index) => (
                  <ImageItem key={index}>
                    <img src={img.preview} alt={`Upload ${index + 1}`} />
                    <RemoveImageButton
                      onClick={() => removeImage(index)}
                      type="button"
                    >
                      <X size={14} />
                    </RemoveImageButton>
                  </ImageItem>
                ))}
              </ImagesGrid>
            )}

            {images.length < 3 && (
              <>
                <FileInput
                  id="image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />

                <FileInputLabel htmlFor="image-upload">
                  <ImagePlus size={32} />
                  <span>Click to upload images</span>
                </FileInputLabel>
              </>
            )}
          </FormGroup>

          {verificationStatus && (
            <VerificationStatus $status={verificationStatus}>
              {verificationStatus === "verifying" && (
                <div className="spinner"></div>
              )}
              <span>{verificationMessage}</span>
            </VerificationStatus>
          )}

          <PrimaryButton
            type="submit"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? "Verifying..." : "Post Game"}
          </PrimaryButton>
        </Form>
      </Modal>
    </ModalOverlay>
  );
}

export default PostAdModal;
