document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "live_Z8LNsAjVGinUePHE70acssC1hbJeqTVpuLhTuQm9D1gXTUZSAeYcx3dsDFvPcJ7m";
  const API_URL = "https://api.thedogapi.com/v1/breeds";

  const randomDogImageContainer = document.getElementById("randomDogImage");
  const breedSelect = document.getElementById("breedSelect");
  const breedInfo = document.getElementById("breedInfo");
  const breedSearch = document.getElementById("breedSearch");
  const autocompleteList = document.getElementById("autocompleteList");
  const traitsList = document.getElementById("traitsList");
  const weightSlider = document.getElementById("weightSlider");
  const weightMin = document.getElementById("weightMin");
  const weightMax = document.getElementById("weightMax");
  const swiperWrapper = document.getElementById("swiperWrapper");

  fetch(API_URL, {
    headers: {
      "x-api-key": API_KEY
    }
  })
    .then(res => res.json())
    .then(data => {
      // ... everything else stays the same

      const allBreeds = data;

      // HOME PAGE - Swiper Carousel
      if (swiperWrapper) {
        const breedsWithImages = data.filter(b => b.reference_image_id);
        const randomBreeds = [...Array(5)].map(() => {
          return breedsWithImages[Math.floor(Math.random() * breedsWithImages.length)];
        });

        randomBreeds.forEach(breed => {
          const slide = document.createElement("div");
          slide.className = "swiper-slide";
          slide.innerHTML = `
            <img src="https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg" alt="${breed.name}" style="width: 100%; border-radius: 10px;">
          `;
          swiperWrapper.appendChild(slide);
        });

        new Swiper(".swiper-container", {
          loop: true,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
        });

        return;
      }

      // ABOUT PAGE - Random Dog Image
      if (randomDogImageContainer) {
        const randomBreed = data[Math.floor(Math.random() * data.length)];
        if (randomBreed && randomBreed.reference_image_id) {
          const img = document.createElement("img");
          img.src = `https://cdn2.thedogapi.com/images/${randomBreed.reference_image_id}.jpg`;
          img.alt = randomBreed.name;
          img.className = "random-dog-image";
          randomDogImageContainer.appendChild(img);
        }
        return;
      }

      // EXPLORE PAGE - Check required elements
      const requiredElements = [breedSelect, breedInfo, breedSearch, autocompleteList, traitsList, weightSlider, weightMin, weightMax];
      if (requiredElements.some(el => !el)) {
        console.warn("Missing required DOM elements for Explore Dogs page. Aborting init.");
        return;
      }

      // Initialize noUiSlider
      noUiSlider.create(weightSlider, {
        start: [0, 200],
        connect: true,
        range: { min: 0, max: 200 },
        step: 1,
        tooltips: true,
        format: {
          to: value => Math.round(value),
          from: value => parseInt(value)
        }
      });

      weightSlider.noUiSlider.on('update', function (values) {
        weightMin.textContent = values[0];
        weightMax.textContent = values[1];
      });

      weightSlider.noUiSlider.on('change', function () {
        applyFilters();
      });

      // Populate dropdown
      breedSelect.innerHTML = "";
      data.forEach(breed => {
        const option = document.createElement("option");
        option.value = breed.id;
        option.textContent = breed.name;
        breedSelect.appendChild(option);
      });

      // Populate trait checkboxes
      const traitSet = new Set();
      data.forEach(breed => {
        if (breed.temperament) {
          breed.temperament.split(",").forEach(t => traitSet.add(t.trim()));
        }
      });

      [...traitSet].sort().forEach(trait => {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = trait;
        checkbox.addEventListener("change", applyFilters);
        li.appendChild(checkbox);
        li.append(" " + trait);
        traitsList.appendChild(li);
      });

      breedSelect.addEventListener("change", () => {
        const selected = data.find(b => b.id == breedSelect.value);
        if (selected) renderBreedCards([selected]);
      });

      breedSearch.addEventListener("input", () => {
        const searchVal = breedSearch.value.toLowerCase();
        autocompleteList.innerHTML = "";

        if (searchVal.length === 0) return;

        const matches = data.filter(breed =>
          breed.name.toLowerCase().startsWith(searchVal)
        );

        matches.slice(0, 10).forEach(breed => {
          const li = document.createElement("li");
          li.textContent = breed.name;
          li.addEventListener("click", () => {
            breedSearch.value = breed.name;
            breedSelect.value = breed.id;
            renderBreedCards([breed]);
            autocompleteList.innerHTML = "";
          });
          autocompleteList.appendChild(li);
        });
      });

      // Show all breeds by default
      renderBreedCards(data);

      function applyFilters() {
        const selectedTraits = Array.from(
          traitsList.querySelectorAll("input:checked")
        ).map(input => input.value);

        const [minWeight, maxWeight] = weightSlider.noUiSlider.get().map(v => parseInt(v, 10));

        const filtered = data.filter(breed => {
          const weightStr = breed.weight.imperial || "";
          const weightParts = weightStr.split("-").map(w => parseInt(w.trim(), 10)).filter(n => !isNaN(n));
          const maxBreedWeight = weightParts[1] || weightParts[0] || 0;

          const matchesTraits = selectedTraits.length === 0 || (
            breed.temperament &&
            selectedTraits.every(trait => breed.temperament.includes(trait))
          );

          const matchesSize = maxBreedWeight >= minWeight && maxBreedWeight <= maxWeight;

          return matchesTraits && matchesSize;
        });

        breedSelect.innerHTML = "";
        filtered.forEach(breed => {
          const option = document.createElement("option");
          option.value = breed.id;
          option.textContent = breed.name;
          breedSelect.appendChild(option);
        });

        if (filtered.length > 0) {
          renderBreedCards(filtered);
        } else {
          breedInfo.innerHTML = "<p>No breeds match selected filters.</p>";
        }
      }

      function renderBreedCards(breeds) {
        breedInfo.innerHTML = "";
        breeds.forEach(breed => {
          const card = document.createElement("div");
          card.className = "breed-card";
          card.innerHTML = `
            <h2>${breed.name}</h2>
            <img src="https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg" alt="${breed.name}">
            <p><strong>Temperament:</strong> ${breed.temperament || "N/A"}</p>
            <p><strong>Weight:</strong> ${breed.weight.imperial || "N/A"} lbs (${breed.weight.metric || "N/A"} kg)</p>
            <p><strong>Height:</strong> ${breed.height.imperial || "N/A"} in (${breed.height.metric || "N/A"} cm)</p>
            <p><strong>Life Span:</strong> ${breed.life_span || "N/A"}</p>
            <p><strong>Breed Group:</strong> ${breed.breed_group || "N/A"}</p>
            <p><strong>Bred For:</strong> ${breed.bred_for || "N/A"}</p>
          `;
          breedInfo.appendChild(card);
        });
      }
    })
    .catch(error => {
      if (breedInfo) {
        breedInfo.innerHTML = "<p>Failed to load dog breeds. Try again later.</p>";
      }
      console.error("Error fetching dog breeds:", error);
    });
});
