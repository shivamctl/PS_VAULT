import { DollarSign, CheckCircle, Clock, Images, MessageCircle } from "lucide-react";
import {
  Card,
  CardBadge,
  CardImage,
  ImageCount,
  ConditionBadge,
  CardContent,
} from "../../ui/style.jsx";
import { getTimeAgo } from "../../utils/formatting/time.js";
import ImageWithFallback from "../shared/ImageWithFallback.jsx";

function ListingCard({ listing, onClick, isOwnListing }) {
  return (
    <Card onClick={onClick}>
      {listing.isSold && (
        <CardBadge>
          <CheckCircle size={16} />
          <span>SOLD</span>
        </CardBadge>
      )}

      <CardImage>
        {(listing.imageUrls && listing.imageUrls.length > 0) || listing.imageUrl ? (
          <>
            <ImageWithFallback
              src={
                listing.imageUrls && listing.imageUrls.length > 0
                  ? listing.imageUrls[0]
                  : listing.imageUrl
              }
              alt={listing.title}
              className="card-image"
            />
            <div className="overlay"></div>
          </>
        ) : (
          <div className="no-image">
            <p>No image</p>
          </div>
        )}

        {listing.imageUrls && listing.imageUrls.length > 1 && (
          <ImageCount>
            <Images size={14} />
            <span>{listing.imageUrls.length}</span>
          </ImageCount>
        )}

        <ConditionBadge>{listing.condition}</ConditionBadge>
      </CardImage>

      <CardContent>
        <h3 className="card-title">{listing.title}</h3>
        <p className="description">{listing.description}</p>

        <div className="price-row">
          <div className="price">
            <DollarSign size={20} style={{ color: "#00d9ff" }} />
            <span>${listing.price}</span>
          </div>
          <div className="platform">{listing.platform}</div>
        </div>

        <div className="footer">
          <div className="footer-row">
            <span className="seller">by {listing.email}</span>
            {!isOwnListing && !listing.isSold && (
              <div className="chat">
                <MessageCircle size={16} />
                <span>Chat</span>
              </div>
            )}
          </div>
          {listing.createdAt && (
            <div className="time">
              <Clock size={12} />
              <span>{getTimeAgo(listing.createdAt)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ListingCard;
