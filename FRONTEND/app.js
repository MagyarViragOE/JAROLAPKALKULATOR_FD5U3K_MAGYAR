document.addEventListener("DOMContentLoaded", function () {
  const tileForm = document.getElementById("tileForm");
  const resultSection = document.getElementById("result");
  const tileCountElement = document.getElementById("tileCount");
  const tilePreviewElement = document.getElementById("tilePreview");

  resultSection.style.display = "none";

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
      console.error("Error fetching tile sizes:", error);
    });

  function validatePositiveInput(input) {
    const value = parseFloat(input.value);
    if (isNaN(value) || value <= 0) {
      input.setCustomValidity("Az értéknek nagyobbnak kell lennie, mint 0");
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
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        displayResults(data, areaWidth, areaHeight);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Hiba történt a számítás során. Kérjük, próbálja újra később.");
      });
  });

  function displayResults(data, areaWidth, areaHeight) {
    resultSection.style.display = "block";

    const totalTiles = data.totalTiles;
    const orientation = data.orientation ? "függőleges" : "vízszintes";
    const tileWidth = data.tileWidth;
    const tileHeight = data.tileHeight;

    tileCountElement.innerHTML = `
          <strong>Szükséges járólapok száma:</strong> ${totalTiles} db (${
      (totalTiles * tileHeight * tileWidth) / 10000
    } négyzetméter) <br>
          <strong>Optimális elhelyezés:</strong> ${orientation}<br>
          <strong>Járólap méret:</strong> ${tileWidth}x${tileHeight} cm
      `;

    renderTilePreview(data, areaWidth, areaHeight);

    window.addEventListener("resize", function () {
      renderTilePreview(data, areaWidth, areaHeight);
    });
  }

  function renderTilePreview(data, areaWidth, areaHeight) {
    tilePreviewElement.innerHTML = "";

    const containerWidth = tilePreviewElement.parentElement.clientWidth - 40;
    const aspectRatio = areaHeight / areaWidth;

    let previewWidth = Math.min(containerWidth, 700);
    let previewHeight = previewWidth * aspectRatio;

    if (previewHeight > 500) {
      previewHeight = 500;
      previewWidth = previewHeight / aspectRatio;
    }

    tilePreviewElement.style.width = `${previewWidth}px`;
    tilePreviewElement.style.height = `${previewHeight}px`;
    tilePreviewElement.style.position = "relative";
    tilePreviewElement.style.border = "1px solid #ccc";
    tilePreviewElement.style.overflow = "hidden"; // Hide tiles that extend beyond the area

    // Size of tiles in preview pixels
    const scaleFactor = previewWidth / areaWidth;
    const tilePxWidth = data.tileWidth * scaleFactor;
    const tilePxHeight = data.tileHeight * scaleFactor;

    // Calculate how many whole tiles we need
    const completeTilesX = Math.floor(areaWidth / data.tileWidth);
    const completeTilesY = Math.floor(areaHeight / data.tileHeight);

    // Calculate the remaining space that needs partial tiles
    const remainingWidth = areaWidth % data.tileWidth;
    const remainingHeight = areaHeight % data.tileHeight;

    // Colors for better visualization
    const tileColors = ["#cccccc", "#f2e1ef", "#faf5f9"];

    // Add complete tiles
    for (let y = 0; y < completeTilesY; y++) {
      for (let x = 0; x < completeTilesX; x++) {
        const colorIndex = (x + y) % 3;
        addTile(x * tilePxWidth, y * tilePxHeight, tilePxWidth, tilePxHeight, tileColors[colorIndex]);
      }
    }

    // Add partial tiles along the right edge
    if (remainingWidth > 0) {
      for (let y = 0; y < completeTilesY; y++) {
        const colorIndex = (completeTilesX + y) % 3;
        addTile(
          completeTilesX * tilePxWidth,
          y * tilePxHeight,
          remainingWidth * scaleFactor,
          tilePxHeight,
          tileColors[colorIndex]
        );
      }
    }

    // Add partial tiles along the bottom edge
    if (remainingHeight > 0) {
      for (let x = 0; x < completeTilesX; x++) {
        const colorIndex = (x + completeTilesY) % 3;
        addTile(
          x * tilePxWidth,
          completeTilesY * tilePxHeight,
          tilePxWidth,
          remainingHeight * scaleFactor,
          tileColors[colorIndex]
        );
      }
    }

    // Add the corner piece if both width and height have remainders
    if (remainingWidth > 0 && remainingHeight > 0) {
      const colorIndex = (completeTilesX + completeTilesY) % 3;
      addTile(
        completeTilesX * tilePxWidth,
        completeTilesY * tilePxHeight,
        remainingWidth * scaleFactor,
        remainingHeight * scaleFactor,
        tileColors[colorIndex]
      );
    }

    // Helper function to add a tile to the preview
    function addTile(left, top, width, height, backgroundColor) {
      const tileElement = document.createElement("div");
      tileElement.className = "tile";

      tileElement.style.position = "absolute";
      tileElement.style.left = `${left}px`;
      tileElement.style.top = `${top}px`;
      tileElement.style.width = `${width}px`;
      tileElement.style.height = `${height}px`;

      tileElement.style.backgroundColor = backgroundColor;
      tileElement.style.border = "1px solid #bbb";
      tileElement.style.boxSizing = "border-box";

      tilePreviewElement.appendChild(tileElement);
    }
  }
});
