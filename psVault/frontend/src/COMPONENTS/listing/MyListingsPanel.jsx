import { useState, useEffect } from "react";
import { Package, CheckCircle, DollarSign, X } from "lucide-react";
import apiClient from "../../utils/api/client.js";
import {
  PanelContainer,
  PanelHeader,
  IconButton,
  PanelContent,
  LoadingContainer,
  Spinner,
  EmptyState,
  ListingsList,
  ListingItem,
  SmallButton,
  CardBadge,
} from "../../ui/style.jsx";

function MyListingsPanel({ onClose, accessToken, email, onListingDeleted }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState(null);

  const userEmail = apiClient.getCurrentUser().email;

  const loadMyListings = async () => {
    try {
      const data = await apiClient.getListings();
      const myListings = data.filter((listing) => listing.email === userEmail);
      setListings(myListings);
    } catch (err) {
      console.error("Error loading my listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyListings();
  }, []);

  const handleDelete = async (listingId) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await apiClient.deleteListing(listingId);
      await loadMyListings();
      onListingDeleted();
    } catch (err) {
      console.error("Error deleting listing:", err);
    }
  };

  const handleMarkAsSold = async (listingId) => {
    try {
      await apiClient.markListingAsSold(listingId);
      await loadMyListings();
      onListingDeleted();
    } catch (err) {
      console.error("Error marking as sold:", err);
    }
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <h3>My Listings</h3>
        <IconButton onClick={onClose}>
          <X size={24} />
        </IconButton>
      </PanelHeader>

      <PanelContent>
        {loading ? (
          <LoadingContainer>
            <div>
              <Spinner />
              <span>Loading...</span>
            </div>
          </LoadingContainer>
        ) : listings.length === 0 ? (
          <EmptyState>
            <Package size={48} />
            <p>No listings yet</p>
          </EmptyState>
        ) : (
          <ListingsList>
            {listings.map((listing) => {
              const firstImage =
                listing.imageUrls?.length > 0
                  ? listing.imageUrls[0]
                  : "/placeholder.png";

              return (
                <ListingItem key={listing.listingId}>
                  <img
                    src={firstImage}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "0.75rem",
                    }}
                    alt={listing.title}
                  />

                  <div className="header">
                    <h4>{listing.title}</h4>

                    {listing.isSold && (
                      <CardBadge
                        style={{ position: "static", marginLeft: "0.5rem" }}
                      >
                        <CheckCircle size={14} />
                        <span style={{ fontSize: "0.75rem" }}>SOLD</span>
                      </CardBadge>
                    )}

                    {listing.status === "rejected" && (
                      <CardBadge
                        style={{
                          position: "static",
                          marginLeft: "0.5rem",
                          backgroundColor: "#ff4d4d",
                        }}
                      >
                        <X size={14} />
                        <span style={{ fontSize: "0.75rem" }}>REJECTED</span>
                      </CardBadge>
                    )}

                    {listing.status === "failed" && (
                      <CardBadge
                        style={{
                          position: "static",
                          marginLeft: "0.5rem",
                          backgroundColor: "#ff8800",
                        }}
                      >
                        <X size={14} />
                        <span style={{ fontSize: "0.75rem" }}>FAILED</span>
                      </CardBadge>
                    )}
                  </div>

                  <div className="info">
                    <span>
                      <DollarSign size={14} /> ${listing.price}
                    </span>
                    <span>{listing.platform}</span>
                    <span>{listing.condition}</span>
                  </div>

                  <div className="actions">
                    {(listing.status === "rejected" ||
                      listing.status === "failed") && (
                      <SmallButton
                        $variant="danger"
                        onClick={() => setSelectedReason(listing.reason)}
                      >
                        View Reason
                      </SmallButton>
                    )}

                    {!listing.isSold && (
                      <SmallButton
                        $variant="success"
                        onClick={() => handleMarkAsSold(listing.listingId)}
                      >
                        Mark as Sold
                      </SmallButton>
                    )}

                    <SmallButton
                      $variant="danger"
                      onClick={() => handleDelete(listing.listingId)}
                    >
                      Delete
                    </SmallButton>
                  </div>
                </ListingItem>
              );
            })}
          </ListingsList>
        )}
      </PanelContent>
      {selectedReason && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "400px",
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 5px 10px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>Rejection Reason</h3>
            <p style={{ marginBottom: "20px" }}>{selectedReason}</p>

            <SmallButton
              $variant="primary"
              onClick={() => setSelectedReason(null)}
              style={{ width: "100%" }}
            >
              Close
            </SmallButton>
          </div>
        </div>
      )}
    </PanelContainer>
  );
}

export default MyListingsPanel;
