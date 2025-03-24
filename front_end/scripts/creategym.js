document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("gymForm").addEventListener("submit",async (event)=>{
    event.preventDefault();
  
    const namegym = document.getElementById("name").value;
    const town = document.getElementById("town").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    const pricebymounth = document.getElementById("pricePerMonth").value;
    const phonenumber = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const messagebox = document.getElementById("messagebox");
  
    try {
    const response = await fetch("http://localhost:5000/gym/creategym", {
      method:"POST",
      headers: { "Content-Type": "application/json" },
      body:JSON.stringify({gymname:namegym,town:town,latitude:latitude,long:longitude,pricebymounth:pricebymounth,phonenumber:phonenumber,email:email}),
      credentials: "include",
    })
  
    const data = await response.json();
    if (response.ok) {
      messagebox.style.color = "green";
      messagebox.textContent = data.message;
      setTimeout(() => {
        window.location.href = "/"; // will change but for now 5liha ll home
      }, 1000);
    }
    else {
      messagebox.style.color = "red";
      messagebox.textContent = data.message;
    }
  }
  catch(error) {
    messagebox.style.color = "red";
    messagebox.textContent = "Server error";
    console.error("Error:", error);
  }
  
  
  })
  });