// Usunięcie istniejących danych
db.users.deleteMany({});
db.cars.deleteMany({});
db.reservations.deleteMany({});

// Dodanie użytkownika admina
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2b$10$2RFhO3r3uFmwA8RbrBWX8estf6FNP8QyuqyxJp.QH1KJpx6U7wVMm",
  role: "admin"
});

// Dodanie samochodów
db.cars.insertMany([
  {
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    pricePerDay: 100,
    available: true,
    imageUrl: "https://images.vehistools.pl/imagin/?make=toyota&modelFamily=corolla&modelRange=corolla&modelVariant=sa&modelYear=2019&paintId=pspc0096&customer=plvehis-sp-z-oo&trim=0&fileType=webp&angle=28&width=900&zoomType=relative&zoomLevel=100&tailoring=vehis"
  },
  {
    brand: "Honda",
    model: "Civic",
    year: 2019,
    pricePerDay: 120,
    available: true,
    imageUrl: "https://cdn.wheel-size.com/automobile/body/honda-civic-2019-2022-1684384835.4558437.jpg"
  }
]);