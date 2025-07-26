import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const yourAPIKey = "openuv-1xqqzformdd8qrgu-io"
const config = {
    headers: {
      "x-access-token": yourAPIKey,
    }
  };

  app.get("/", (req, res) => {
    res.redirect("/uv");
  });  
app.get("/uv", async (req, res) => {
  
    
  const useLat = parseFloat(req.query.lat) || 34.0522;;
const useLng = parseFloat(req.query.lng) || -118.2437;
let city = req.query.city ||"Unknown";
const geoResponse = await axios.get(
  `https://nominatim.openstreetmap.org/reverse?lat=${useLat}&lon=${useLng}&format=json`,
    {
      headers: {
        "User-Agent": "UVIndexApp/1.0 (fainmariya@gmail.com)",
      },
    }
  );
  console.log("Nominatim response:", geoResponse.data);
  city =
      geoResponse.data.address.city ||
      geoResponse.data.address.town ||
      geoResponse.data.address.village ||
      "Unknown";
      if (city === "תל־אביב–יפו") {
        city = "Tel Aviv";
      } else if (city === "חיפה") {
        city = "Haifa";
      }
  try {
    const response = await axios.get(`https://api.openuv.io/api/v1/uv?lat=${useLat}&lng=${useLng}`, config);
    const answer = response.data;
    const uvTimeUTC = answer.result.uv_max_time;
    const uvTimeLocal = new Date(uvTimeUTC);

// Convert to 12-hour format like "3:07 PM"
const uvTimeFormatted = uvTimeLocal.toLocaleTimeString("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
    res.render("index.ejs", {
        uv: answer.result.uv,
        uv_max_time:uvTimeFormatted,
        city
        
        
        });
       
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      uv: null,
      uv_max_time: "Unavailable",
      city: city
    });
  }
});



//*app.post("/activity", async (req, res) => {
    
   // try {
  //    const result = await axios.get(yourAPIKey + "/activity", config);
   //   res.render("index.ejs", { content: JSON.stringify(result.data, null, 2) });
  //  } catch (error) {
   //   res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  //  }
 // });

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
