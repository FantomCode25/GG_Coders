import { Router } from 'express';
import Farmer from "../models/farmerModel.js";
import getLocationHierarchy from "../gemini.js";
import NPK from "../models/NPKModel.js";
import FarmerCrop from "../models/farmerCropsModel.js";
import axios from "axios";

const router = Router();

router.post("/checkFarmer", async (req, res) => {
    try{
      const {phoneNumber} = req.body;
      console.log(phoneNumber);
      const farmer = await Farmer.findOne({phoneNumber});
      if(farmer)
        res.json({exists: true});
      else
        res.json({exists: false});
    }
    catch(err){
      res.status(500).json({error: err});
    }
});

router.post("/registerFarmer", async (req, res) => {
    try{
      const {name, phoneNumber, townBody, landArea} = req.body;
      console.log(name, phoneNumber, townBody, landArea);

      const {state, district, block, town} = await getLocationHierarchy(townBody);
      console.log(state, district, block, town);
      const oldFarmer = await Farmer.findOne({phoneNumber});
      if(oldFarmer){
        res.status(403).json({registered: false, message: 'Farmer already exists'});
        return;
      }
      const farmer = new Farmer({name, phoneNumber, district, town, block, state, landArea});
      await farmer.save();
      res.json({registered: true});
    }
    catch(err){
      res.status(500).json({error: err});
    }
});

router.post("/getRecommendations", async (req, res) => {
    try{
      const {phoneNumber} = req.body;
      console.log(phoneNumber);
      const farmer = await Farmer.findOne({phoneNumber});
      if(!farmer){
        console.log("Farmer not found");
        res.status(404).json({recommendations: null});
        return;
      }
      const {town,district,state} = farmer;
      console.log(town,district,state);
      //const {state, district, block, correctTown} = await getLocationHierarchy(town);
      const {nitrogenVal, potassiumVal, phosphorousVal} = await getNPKValues(town, district,state);
      console.log(nitrogenVal, potassiumVal, phosphorousVal);
      const weather = await getWeatherByLocation1(town);
      const { temperature, humidity } = weather;   
      console.log(temperature, humidity);
      const fertilizer = "Urea";
      const soilType = "Clayey";  
      const moisture = 0;

      console.log(temperature, humidity, moisture, soilType, nitrogenVal, potassiumVal, phosphorousVal, fertilizer);

      const requestBody = {
        Temparature: temperature,
        Humidity: humidity,
        Moisture: moisture, // If you have this, replace 0
        Soil_Type: soilType,
        Nitrogen: nitrogenVal,
        Potassium: potassiumVal,
        Phosphorous: phosphorousVal,
        Fertilizer_Name: fertilizer
      };
  
      const response = await axios.post("https://da32-14-195-89-114.ngrok-free.app/predict-crop", requestBody);
  
      const recommendations = response.data; // This will be a string crop name
      console.log(recommendations);
      res.json({recommendations});

    }
    catch(err){
      res.status(500).json({error: err});
    }
});

router.post("/getIrrigation", async (req, res) => {
  try{
    const {phoneNumber} = req.body;
    console.log(phoneNumber);
    const farmer = await Farmer.findOne({phoneNumber});
    if(!farmer){
      console.log("Farmer not found");
      res.status(404).json({recommendations: null});
      return;
    }
    const {_id,town, district,state} = farmer;
    console.log(_id,town,district,state);
    const farmerCrop = await FarmerCrop.find({farmerId: _id});  
    console.log(farmerCrop);
    res.json({farmerCrop});
  }
  catch(err){
    res.status(500).json({error: err});
  }
});

async function getNPKValues(town,district,state){
  //const district = getLocationHierarchy(state, town).district.toUpperCase().trim();
  // var { state, district, block, town } = await getLocationHierarchy(state, town);
  // console.log(state+" "+district+" "+block+" "+town);
  district=district.toUpperCase();
  
  
  //console.log(district);
  //search for district in database collection NPK values
  const npk = await NPK.findOne({"District": district});
  if(npk){
    //if found, return the values
    const {
      ["Nitrogen - High"]: rawNitrogenHigh,
      ["Nitrogen - Medium"]: rawNitrogenMedium,
      ["Nitrogen - Low"]: rawNitrogenLow,
      ["Potassium - High"]: rawPotassiumHigh,
      ["Potassium - Medium"]: rawPotassiumMedium,
      ["Potassium - Low"]: rawPotassiumLow,
      ["Phosphorous - Low"]: rawPhosphorousLow,
      ["Phosphorous - High"]: rawPhosphorousHigh,
      ["Phosphorous - Medium"]: rawPhosphorousMedium,
    } = npk;
    
    // Helper function to clean and convert to number
    const parsePercent = (str) => parseFloat(str.replace('%', '').trim());
    
    const nitrogenHigh = parsePercent(rawNitrogenHigh);
    const nitrogenMedium = parsePercent(rawNitrogenMedium);
    const nitrogenLow = parsePercent(rawNitrogenLow);
    const potassiumHigh = parsePercent(rawPotassiumHigh);
    const potassiumMedium = parsePercent(rawPotassiumMedium);
    const potassiumLow = parsePercent(rawPotassiumLow);
    const phosphorousLow = parsePercent(rawPhosphorousLow);
    const phosphorousHigh = parsePercent(rawPhosphorousHigh);
    const phosphorousMedium = parsePercent(rawPhosphorousMedium);

    const nitrogenVal = (nitrogenHigh*700 + nitrogenMedium*420 + nitrogenLow*300)/(100);
    const potassiumVal = (potassiumHigh*30 + potassiumMedium*18 + potassiumLow*5)/(100);
    const phosphorousVal = (phosphorousHigh*350 + phosphorousMedium*200 + phosphorousLow*60)/(100);

    return {
      nitrogenVal,
      potassiumVal,
      phosphorousVal
    };
  }
  else{
    //if not found, return null
    return null;
  }
}

// (async () => {
//   const location = "Puttur";
//   const weather = await getWeatherByLocation1(location);
//   console.log(weather);
// })();

async function getWeatherByLocation1(location) {
  //const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
  // const locResponse= await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${weatherAPIKey}`);
  // const locData = await locResponse.json();

  // const lat = locData[0].lat;
  // const lon = locData[0].lon;
  //const url = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=1&appid=${weatherAPIKey}`;
  //const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherAPIKey}&units=metric`;
  const apiKey = process.env.ACCUWEATHER_API_KEY;
  const query = encodeURIComponent(location);
  const loc_url = `http://dataservice.accuweather.com/locations/v1/search?apikey=${apiKey}&q=${query}&language=en-us&details=true&offset=0&alias=Always`;
  const response1 = await fetch(loc_url);
  const data1 = await response1.json();
  const cityKey=data1[0].Key;
  console.log(cityKey);
  const forecast_url = `http://dataservice.accuweather.com/forecasts/v1/daily/1day/${cityKey}?apikey=${apiKey}&details=true&metric=true`;
  try {
    const response2 = await fetch(forecast_url);
    const data2 = await response2.json();

    if (response2.ok) {
      console.log(data2);
      //const temperature = data.main.temp;
      //const humidity = data.main.humidity;
      const maxTemp = data2.DailyForecasts[0].Temperature.Maximum.Value;
      const minTemp = data2.DailyForecasts[0].Temperature.Minimum.Value;
      const temperature = (maxTemp + minTemp) / 2;
      const humidity = data2.DailyForecasts[0].Day.RelativeHumidity?.Average ?? 50;

      return {temperature,humidity};
    } else {
      throw new Error(data2.message || "Failed to fetch weather data.");
    }
  } catch (err) {
    throw err;
  }
}

async function getWeatherByLocation2(location) {
  console.log(weatherAPIKey);
  //const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
  // const locResponse= await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${weatherAPIKey}`);
  // const locData = await locResponse.json();

  // const lat = locData[0].lat;
  // const lon = locData[0].lon;
  //const url = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=1&appid=${weatherAPIKey}`;
  //const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherAPIKey}&units=metric`;
  const apiKey = process.env.ACCUWEATHER_API_KEY;
  const query = encodeURIComponent(location);
  const loc_url = `http://dataservice.accuweather.com/locations/v1/search?apikey=${apiKey}&q=${query}&language=en-us&details=true&offset=0&alias=Always`;
  const response1 = await fetch(loc_url);
  const data1 = await response1.json();
  const cityKey=data1[0].Key;
  console.log(cityKey);
  const forecast_url = `http://dataservice.accuweather.com/forecasts/v1/daily/1day/${cityKey}?apikey=${apiKey}&details=true&metric=true`;
  try {
    const response2 = await fetch(forecast_url);
    const data2 = await response2.json();

    if (response2.ok) {
      console.log(data2);
      //const temperature = data.main.temp;
      //const humidity = data.main.humidity;
      const rain = data2.DailyForecasts[0].Day.Rain.Value;
      const Eto = data2.DailyForecasts[0].Day.Evapotranspiration.Value;
      return {rain,Eto};
    } else {
      throw new Error(data2.message || "Failed to fetch weather data.");
    }
  } catch (err) {
    throw err;
  }
}

export default router;