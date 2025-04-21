document.addEventListener("DOMContentLoaded", function () {
  const tileForm = document.getElementById("tileForm");
  const resultSection = document.getElementById("result");
  const tileCountElement = document.getElementById("tileCount");
  const tilePreviewElement = document.getElementById("tilePreview");

  const widthInput = document.getElementById("width");
  const heightInput = document.getElementById("height");
  const tileSizeSelect = document.getElementById("tileSize");

  tileSizeSelect.innerHTML = "";

  fetch("http://localhost:5086/api/TileCalculation/tile-sizes")
    .then((response) => response.json())
    .then((tileSizes) => {
      tileSizes.forEach((size) => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = size + " cm";
        tileSizeSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Hiba a járólap méretek lekérésében:", error);
    });

  function validatePositiveInput(input) {
    const value = parseFloat(input.value);
    if (isNaN(value) || value <= 0) {
      input.setCustomValidity("Az értéknek nagyobbnak kell lennie, mint 0.");
      input.reportValidity();
      return false;
    } else {
      input.setCustomValidity("");
      return true;
    }
  }

  widthInput.addEventListener("input", function () {
    validatePositiveInput(widthInput);
  });

  heightInput.addEventListener("input", function () {
    validatePositiveInput(heightInput);
  });

  tileForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validatePositiveInput(widthInput) || !validatePositiveInput(heightInput)) {
      return;
    }

    // Convert meters to centimeters
    const areaWidth = parseFloat(widthInput.value) * 100;
    const areaHeight = parseFloat(heightInput.value) * 100;
    const tileSize = document.getElementById("tileSize").value;

    const requestData = {
      areaWidth: areaWidth,
      areaHeight: areaHeight,
      tileSize: tileSize,
    };

    fetch("http://localhost:5086/api/TileCalculation/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Hálózati hiba.");
        }
        return response.json();
      })
      .then((data) => {
        displayResults(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Hiba történt a számítás során.");
      });
  });

  function displayResults(data) {
    resultSection.style.display = "block";

    const totalTiles = data.totalTiles;
    const orientation = data.orientation ? "függőleges" : "vízszintes";
    const tileWidth = data.tileWidth;
    const tileHeight = data.tileHeight;
    const totalArea = data.totalArea.toFixed(2);

    tileCountElement.innerHTML = `
          <strong>Szükséges járólapok száma:</strong> ${totalTiles} db (${totalArea} m&sup2;) <br>
          <strong>Optimális elhelyezés:</strong> ${orientation}<br>
          <strong>Járólap méret:</strong> ${tileWidth}x${tileHeight} cm
      `;

    renderTilePreview(data);

    window.addEventListener("resize", function () {
      renderTilePreview(data);
    });
  }

  function renderTilePreview(data) {
    tilePreviewElement.innerHTML = "";

    const containerWidth = tilePreviewElement.parentElement.clientWidth - 40;
    const aspectRatio = data.areaHeight / data.areaWidth;

    let previewWidth = Math.min(containerWidth, 700);
    let previewHeight = previewWidth * aspectRatio;

    if (previewHeight > 500) {
      previewHeight = 500;
      previewWidth = previewHeight / aspectRatio;
    }

    // Set dimensions through JavaScript (these are dynamic)
    tilePreviewElement.style.width = `${previewWidth}px`;
    tilePreviewElement.style.height = `${previewHeight}px`;

    const scaleFactor = previewWidth / data.areaWidth;

    data.tiles.forEach((tile) => {
      const tileElement = document.createElement("div");
      tileElement.className = `tile tile-color-${tile.colorIndex}`;

      // Position and size are dynamic and need to be calculated in JS
      tileElement.style.left = `${tile.x * scaleFactor}px`;
      tileElement.style.top = `${tile.y * scaleFactor}px`;
      tileElement.style.width = `${tile.width * scaleFactor}px`;
      tileElement.style.height = `${tile.height * scaleFactor}px`;

      tilePreviewElement.appendChild(tileElement);
    });
  }
});
