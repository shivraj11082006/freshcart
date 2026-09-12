const STORAGE_KEY =
  "freshcart_customer_location";

/* =====================================================
   VALIDATE COORDINATES
===================================================== */

export const isValidCoordinate = (
  latitude,
  longitude
) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  );
};

/* =====================================================
   SAVE CUSTOMER LOCATION
===================================================== */

export const saveCustomerLocation = (
  latitude,
  longitude
) => {
  if (
    !isValidCoordinate(
      latitude,
      longitude
    )
  ) {
    throw new Error(
      "Invalid location received."
    );
  }

  const location = {
    latitude: Number(
      Number(latitude).toFixed(7)
    ),

    longitude: Number(
      Number(longitude).toFixed(7)
    ),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(location)
  );

  return location;
};

/* =====================================================
   GET SAVED CUSTOMER LOCATION
===================================================== */

export const getSavedCustomerLocation = () => {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return null;
    }

    const location =
      JSON.parse(raw);

    if (
      !isValidCoordinate(
        location?.latitude,
        location?.longitude
      )
    ) {
      return null;
    }

    return {
      latitude: Number(
        location.latitude
      ),

      longitude: Number(
        location.longitude
      ),
    };
  } catch {
    return null;
  }
};

/* =====================================================
   CLEAR SAVED CUSTOMER LOCATION
===================================================== */

export const clearSavedCustomerLocation = () => {
  localStorage.removeItem(
    STORAGE_KEY
  );
};

/* =====================================================
   GET CURRENT BROWSER LOCATION
===================================================== */

export const getCurrentBrowserLocation =
  () =>
    new Promise((resolve, reject) => {
      /* ---------------------------------------------
         CHECK BROWSER SUPPORT
      --------------------------------------------- */

      if (!("geolocation" in navigator)) {
        reject(
          new Error(
            "Your browser does not support location services."
          )
        );

        return;
      }

      /* ---------------------------------------------
         GET CURRENT LOCATION
      --------------------------------------------- */

      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const location =
              saveCustomerLocation(
                position.coords.latitude,
                position.coords.longitude
              );

            resolve(location);
          } catch (error) {
            reject(error);
          }
        },

        (error) => {
          const messages = {
            1: "Location permission was denied. Please allow location access in your browser.",

            2: "Your location could not be determined. Please try again.",

            3: "Location request timed out. Please try again.",
          };

          reject(
            new Error(
              messages[error.code] ||
                "Unable to get your location."
            )
          );
        },

        {
          enableHighAccuracy: true,

          timeout: 15000,

          maximumAge: 300000,
        }
      );
    });