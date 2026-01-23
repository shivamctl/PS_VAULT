import { useState } from "react";

import { X, CheckCircle, DollarSign, MessageSquare } from "lucide-react";

import {
  ModalOverlay,
  DetailModalContainer,
  CloseButton,
  DetailModalContent,
  ImageGallery,
  CardBadge,
  PrimaryButton,
} from "../../ui/style.jsx";
import { getTimeAgo } from "../../utils/formatting/time.js";

function ListingDetailModal({
  isOpen,
  onClose,
  listing,
  onChatClick,
  isOwnListing,
  currentUserEmail,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !listing) return null;

  const images =
    listing.imageUrls && listing.imageUrls.length > 0
      ? listing.imageUrls
      : listing.imageUrl
      ? [listing.imageUrl]
      : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <DetailModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton
          onClick={onClose}
          style={{ top: "1rem", right: "1rem", zIndex: 10 }}
        >
          <X size={24} />
        </CloseButton>

        <DetailModalContent>
          <ImageGallery>
            {images.length > 0 ? (
              <>
                <img src={images[currentImageIndex]} alt={listing.title} />
                {images.length > 1 && (
                  <>
                    <button className="nav prev" onClick={prevImage}>
                      ‹
                    </button>
                    <button className="nav next" onClick={nextImage}>
                      ›
                    </button>
                    <div className="dots">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          className={
                            index === currentImageIndex ? "active" : ""
                          }
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="no-image">No images available</div>
            )}
          </ImageGallery>

          <div className="content">
            <div className="header">
              <h2>{listing.title}</h2>
              {listing.isSold && (
                <CardBadge>
                  <CheckCircle size={16} />
                  <span>SOLD</span>
                </CardBadge>
              )}
            </div>

            <div className="price">
              <DollarSign size={32} />
              <span>${listing.price}</span>
            </div>

            <div className="meta">
              <span>{listing.platform}</span>
              <span>{listing.condition}</span>
            </div>

            <div className="description">
              <p>{listing.description}</p>
            </div>

            <div className="seller-info">
              <p>
                <strong>User:</strong> {listing.email}
              </p>
              {listing.createdAt && (
                <p
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                  }}
                >
                  Posted {getTimeAgo(listing.createdAt)}
                </p>
              )}
            </div>

            {!isOwnListing && !listing.isSold && (
              <PrimaryButton
                onClick={onChatClick}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <MessageSquare size={20} />
                <span>Chat with Seller</span>
              </PrimaryButton>
            )}
          </div>
        </DetailModalContent>
      </DetailModalContainer>
    </ModalOverlay>
  );
}

export default ListingDetailModal;
