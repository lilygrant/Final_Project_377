document.addEventListener("DOMContentLoaded", async () => {
  const API_KEY = "live_Z8LNsAjVGinUePHE70acssC1hbJeqTVpuLhTuQm9D1gXTUZSAeYcx3dsDFvPcJ7m";
  const API_URL = "https://api.thedogapi.com/v1/breeds";

  let supabase = null;
  if (window.supabase) {
    supabase = window.supabase.createClient(
      "https://dbxhprztuzhcwkyjqkjv.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieGhwcnp0dXpoY3dreWpxa2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MTYxMTIsImV4cCI6MjA2MzE5MjExMn0.XbuBY9z_9GyegtW0Y6_I8Rt1Qiccu1Njc0E0ELGNLZE"
    );
  }

  const breedSelect = document.getElementById("breedSelect");
  const breedInfo = document.getElementById("breedInfo");
  const breedSearch = document.getElementById("breedSearch");
  const autocompleteList = document.getElementById("autocompleteList");
  const traitsList = document.getElementById("traitsList");
  const weightSlider = document.getElementById("weightSlider");
  const weightMin = document.getElementById("weightMin");
  const weightMax = document.getElementById("weightMax");
  const randomDogImageContainer = document.getElementById("randomDogImage");
  const swiperWrapper = document.getElementById("swiperWrapper");

  const fetchReviewsForBreed = async (breed_id) => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("reviews")
      .select("stars, comment, created_at")
      .eq("breed_id", breed_id)
      .order("created_at", { ascending: false });
    return error ? [] : data;
  };

  function clearFilters() {
    traitsList.querySelectorAll("input:checked").forEach(cb => cb.checked = false);
    weightSlider.noUiSlider.set([0, 200]);
  }

  function filtersAreActive() {
    const hasTraits = traitsList.querySelector("input:checked");
    const [min, max] = weightSlider.noUiSlider.get().map(Number);
    return hasTraits || min !== 0 || max !== 200;
  }

  fetch(API_URL, {
    headers: { "x-api-key": API_KEY }
  })
    .then(res => res.json())
    .then(data => {
      const allBreeds = data;
      const breedsWithImages = data.filter(b => b.reference_image_id);

      if (randomDogImageContainer) {
        const randomBreed = breedsWithImages[Math.floor(Math.random() * breedsWithImages.length)];
        const img = document.createElement("img");
        img.src = `https://cdn2.thedogapi.com/images/${randomBreed.reference_image_id}.jpg`;
        img.alt = randomBreed.name || "Random Dog";
        img.className = "random-dog-image";
        randomDogImageContainer.appendChild(img);
      }

      if (swiperWrapper) {
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
          autoplay: { delay: 3000, disableOnInteraction: false },
          pagination: { el: ".swiper-pagination", clickable: true },
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
          }
        });
      }

      if (!weightSlider?.noUiSlider) {
        noUiSlider.create(weightSlider, {
          start: [0, 200],
          connect: true,
          range: { min: 0, max: 200 },
          step: 1,
          tooltips: false,
          format: {
            to: value => Math.round(value),
            from: value => parseInt(value)
          }
        });
      }

      weightSlider?.noUiSlider.on("update", values => {
        weightMin.textContent = values[0];
        weightMax.textContent = values[1];
      });

      weightSlider?.noUiSlider.on("change", () => applyFilters());

      breedSelect.innerHTML = "";

      const showAllOption = document.createElement("option");
      showAllOption.value = "all";
      showAllOption.textContent = "Show All Breeds";
      breedSelect.appendChild(showAllOption);

      data.forEach(breed => {
        const option = document.createElement("option");
        option.value = breed.id;
        option.textContent = breed.name;
        breedSelect.appendChild(option);
      });

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
        const value = breedSelect.value;
        if (value === "all") {
          clearFilters();
          renderBreedCards(data);
          return;
        }

        const selected = data.find(b => b.id == value);
        if (selected && !filtersAreActive()) {
          clearFilters();
          renderBreedCards([selected]);
        }
      });

      breedSearch.addEventListener("input", () => {
        const searchVal = breedSearch.value.toLowerCase();
        autocompleteList.innerHTML = "";
        if (!searchVal) return;

        data.filter(b => b.name.toLowerCase().startsWith(searchVal))
          .slice(0, 10)
          .forEach(breed => {
            const li = document.createElement("li");
            li.textContent = breed.name;
            li.addEventListener("click", () => {
              breedSearch.value = breed.name;
              breedSelect.value = breed.id;
              autocompleteList.innerHTML = "";

              if (!filtersAreActive()) {
                clearFilters();
                renderBreedCards([breed]);
              }
            });
            autocompleteList.appendChild(li);
          });
      });

      function applyFilters() {
        const selectedTraits = Array.from(traitsList.querySelectorAll("input:checked")).map(i => i.value);
        const [minWeight, maxWeight] = weightSlider.noUiSlider.get().map(v => parseInt(v, 10));

        const filtersAreClear = selectedTraits.length === 0 && minWeight === 0 && maxWeight === 200;
        if (filtersAreClear) {
          breedInfo.innerHTML = "<p>Please select a filter to see results.</p>";
          breedSelect.selectedIndex = 0;
          return;
        }

        const filtered = data.filter(breed => {
          const weightStr = breed.weight.imperial || "";
          const weightParts = weightStr.split("-").map(w => parseInt(w.trim(), 10));
          const minBreedWeight = weightParts[0];
          const maxBreedWeight = weightParts[1] ?? minBreedWeight;

          if (isNaN(minBreedWeight) || isNaN(maxBreedWeight)) return false;

          const breedTraits = breed.temperament ? breed.temperament.split(",").map(t => t.trim()) : [];
          const matchesTraits = selectedTraits.length === 0 || selectedTraits.every(t => breedTraits.includes(t));
          const matchesSize = minBreedWeight >= minWeight && maxBreedWeight <= maxWeight;

          return matchesTraits && matchesSize;
        });

        const uniqueBreeds = Array.from(new Map(filtered.map(b => [b.id, b])).values());

        breedSelect.selectedIndex = 0;
        breedInfo.innerHTML = uniqueBreeds.length > 0
          ? ""
          : "<p>No breeds match selected filters.</p>";

        renderBreedCards(uniqueBreeds);
      }

      async function renderBreedCards(breeds) {
        breedInfo.innerHTML = "";

        const renderedIds = new Set();

        for (const breed of breeds) {
          if (renderedIds.has(breed.id)) {
            console.warn(`Duplicate detected: ${breed.name} (id: ${breed.id})`);
            continue;
          }
          renderedIds.add(breed.id);

          const card = document.createElement("div");
          card.className = "breed-card";

          let reviewsHTML = "";
          if (supabase) {
            const reviews = await fetchReviewsForBreed(breed.id);
            reviewsHTML = reviews.length > 0
              ? reviews.map(r => `
                  <div class="review">
                    <strong>⭐ ${r.stars}</strong> - ${r.comment}
                    <div class="review-date">${new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                `).join("")
              : "<p class='no-reviews'>No reviews yet.</p>";
          }

          card.innerHTML = `
            <h2>${breed.name}</h2>
            <img src="https://cdn2.thedogapi.com/images/${breed.reference_image_id}.jpg" alt="${breed.name}">
            <p><strong>Temperament:</strong> ${breed.temperament || "N/A"}</p>
            <p><strong>Weight:</strong> ${breed.weight.imperial || "N/A"} lbs (${breed.weight.metric || "N/A"} kg)</p>
            <p><strong>Height:</strong> ${breed.height.imperial || "N/A"} in (${breed.height.metric || "N/A"} cm)</p>
            <p><strong>Life Span:</strong> ${breed.life_span || "N/A"}</p>
            <p><strong>Breed Group:</strong> ${breed.breed_group || "N/A"}</p>
            <p><strong>Bred For:</strong> ${breed.bred_for || "N/A"}</p>

            <div class="breed-reviews">
              <h3>Reviews</h3>
              ${reviewsHTML}
            </div>

            <div class="review-form">
              <h3>Leave a Review</h3>
              <form data-breed-id="${breed.id}">
                <label>Stars:
                  <select name="stars">
                    <option value="5">⭐️⭐️⭐️⭐️⭐️</option>
                    <option value="4">⭐️⭐️⭐️⭐️</option>
                    <option value="3">⭐️⭐️⭐️</option>
                    <option value="2">⭐️⭐️</option>
                    <option value="1">⭐️</option>
                  </select>
                </label><br/>
                <textarea name="comment" rows="2" placeholder="Write your review..." required></textarea><br/>
                <button type="submit">Submit Review</button>
              </form>
            </div>
          `;

          breedInfo.appendChild(card);
        }

        console.log(`Rendered ${renderedIds.size} unique breeds out of ${breeds.length} requested`);
      }

      document.addEventListener("submit", async (e) => {
        if (!e.target.matches(".review-form form")) return;
        e.preventDefault();

        const form = e.target;
        const breedId = parseInt(form.getAttribute("data-breed-id"));
        const stars = parseInt(form.stars.value, 10);
        const comment = form.comment.value.trim();

        if (!comment || isNaN(breedId) || isNaN(stars)) {
          alert("Please complete the form.");
          return;
        }

        if (!supabase) return alert("Supabase is not available.");

        const { error } = await supabase
          .from("reviews")
          .insert([{ breed_id: breedId, stars, comment }]);

        if (error) {
          console.error("Review submission failed:", error);
          alert("Failed to save review. Please try again.");
        } else {
          alert("Review submitted!");
          form.reset();
          applyFilters(); 
        }
      });
    })
    .catch(error => {
      if (breedInfo) {
        breedInfo.innerHTML = "<p>Failed to load dog breeds. Try again later.</p>";
      }
      console.error("Error fetching dog breeds:", error);
    });
});
