const express = require("express");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { v2 as cloudinary } from 'cloudinary';

(async function() {

    // Configuration
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL // Using the URL from your .env file
    });
    
    // Upload an image
    exports.uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();