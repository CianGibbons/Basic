function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

function goToCitySlider() {
  var city = document.getElementById("cityInput").value;
  city = slugify(city);
  setTimeout(function () {
    document.location.href = "http://danu7.it.nuigalway.ie:8611/slider/" + city;
  }, 250);
}
const node = document.getElementById("cityInput");
node.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    goToCitySlider();
  }
});
