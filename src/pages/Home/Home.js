import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Navbar,
  HotelCard,
  Categories,
  SearchStayWithDate,
  Filter,
  AuthModal,
  ProfileDropDown,
  Alert
} from "../../components";
import "./Home.css";
import { useCategory, useDate, useFilter, useAuth, useAlert } from "../../context";
import {
  getHotelsByPrice,
  getHotelsByRoomsAndBeds,
  getHotelsByPropertyType,
  getHotelsByRatings,
  getHotelsByCancelation,
} from "../../utils";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const Home = () => {
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(16);
  const [testData, setTestData] = useState([]);
  const [hotels, setHotels] = useState([]);
  const { hotelCategory } = useCategory();
  const { isSearchModalOpen } = useDate();
  const {
    isFilterModalOpen,
    priceRange,
    noOfBathrooms,
    noOfBedrooms,
    noOfBeds,
    propertyType,
    traveloRating,
    isCancelable,
  } = useFilter();

  const { isAuthModalOpen, isDropDownModalOpen } = useAuth();
  const { alert } = useAlert();

  useEffect(() => {
    (async () => {
      try {
        console.log('Fetching hotels with category:');
        const response = await fetch(`${backendUrl}/api/hotels`);
        const data = await response.json();
        console.log('Data fetched:', data);

        setTestData(data);
        setHotels(data ? data.slice(0, 16) : []);
      } catch (err) {
        console.error('Error fetching hotels:', err);
      }
    })();
}, []);

  const fetchMoreData = () => {
    if (hotels.length >= testData.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      if (hotels && hotels.length > 0) {
        setHotels(
          hotels.concat(testData.slice(currentIndex, currentIndex + 16))
        );
        setCurrentIndex((prev) => prev + 16);
      } else {
        setHotels([]);
      }
    }, 1000);
  };

  const filteredHotelsByPrice = getHotelsByPrice(hotels, priceRange);
  const filteredHotelsByBedsAndRooms = getHotelsByRoomsAndBeds(
    filteredHotelsByPrice,
    noOfBathrooms,
    noOfBedrooms,
    noOfBeds
  );
  const filteredHotelsByPropertyType = getHotelsByPropertyType(
    filteredHotelsByBedsAndRooms,
    propertyType
  );

  const filteredHotelsByRatings = getHotelsByRatings(
    filteredHotelsByPropertyType,
    traveloRating
  );

  const filteredHotelsByCancelation = getHotelsByCancelation(
    filteredHotelsByRatings,
    isCancelable
  );

  return (
    <div className="relative">
      <Navbar route="home"/>
      {hotels && hotels.length > 0 ? (
        
        <InfiniteScroll
          dataLength={hotels.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            hotels.length > 0 && <h3 className="alert-text">Loading...</h3>
          }
          endMessage={<p className="alert-text">You have seen it all</p>}
        >
          <main className="main d-flex align-center wrap gap-larger">
            {filteredHotelsByCancelation &&
              filteredHotelsByCancelation.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
          </main>
        </InfiniteScroll>
      ) : (
        <></>
      )}
      {isDropDownModalOpen && <ProfileDropDown />}
      {isSearchModalOpen && <SearchStayWithDate />}
      {isFilterModalOpen && <Filter />}
      {isAuthModalOpen && <AuthModal />}
      {alert.open && <Alert />}
    </div>
  );
};
