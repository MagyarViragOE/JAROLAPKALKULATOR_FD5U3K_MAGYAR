document.addEventListener("DOMContentLoaded", function () {
  const tileForm = document.getElementById("tileForm");
  const resultSection = document.getElementById("result");
  const tileCountElement = document.getElementById("tileCount");
  const tilePreviewElement = document.getElementById("tilePreview");

  resultSection.style.display = "none";

  const widthInput = document.getElementById("width");
  const heightInput = document.getElementById("height");

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

    const width = parseFloat(widthInput.value);
    const height = parseFloat(heightInput.value);
    const tileSize = document.getElementById("tileSize").value;

    const [tileSizeWidth, tileSizeHeight] = tileSize.split("x").map((size) => parseInt(size));

    // Client-side calculation instead of API call (I will change it later, it's just for testing)
    const result = calculateTilesLocally(width, height, tileSizeWidth, tileSizeHeight);
    displayResults(result, width, height);
  });

  function calculateTilesLocally(areaWidth, areaHeight, tileWidth, tileHeight) {
    // centimeters to meters
    const tileSizeWidth = tileWidth / 100;
    const tileSizeHeight = tileHeight / 100;

    // Calculate for horizontal orientation (original orientation)
    const horizontalTilesX = Math.ceil(areaWidth / tileSizeWidth);
    const horizontalTilesY = Math.ceil(areaHeight / tileSizeHeight);
    const totalTilesHorizontal = horizontalTilesX * horizontalTilesY;

    // Calculate for vertical orientation (swapped orientation)
    const verticalTilesX = Math.ceil(areaWidth / tileSizeHeight);
    const verticalTilesY = Math.ceil(areaHeight / tileSizeWidth);
    const totalTilesVertical = verticalTilesX * verticalTilesY;

    // Determine which orientation requires fewer tiles
    const useHorizontalOrientation = totalTilesHorizontal <= totalTilesVertical;

    // Set up the result data structure
    let tiles = [];
    let finalTileWidth, finalTileHeight;
    let tilesX, tilesY;

    if (useHorizontalOrientation) {
      finalTileWidth = tileSizeWidth;
      finalTileHeight = tileSizeHeight;
      tilesX = horizontalTilesX;
      tilesY = horizontalTilesY;
    } else {
      finalTileWidth = tileSizeHeight;
      finalTileHeight = tileSizeWidth;
      tilesX = verticalTilesX;
      tilesY = verticalTilesY;
    }

    // Generate tile placement data
    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        tiles.push({
          x: x * finalTileWidth,
          y: y * finalTileHeight,
          width: finalTileWidth,
          height: finalTileHeight,
        });
      }
    }

    return {
      totalTiles: useHorizontalOrientation ? totalTilesHorizontal : totalTilesVertical,
      horizontalOrientation: useHorizontalOrientation,
      tileWidth: useHorizontalOrientation ? tileWidth : tileHeight,
      tileHeight: useHorizontalOrientation ? tileHeight : tileWidth,
      tiles: tiles,
      areaWidth: areaWidth,
      areaHeight: areaHeight,
    };
  }

  function displayResults(data, areaWidth, areaHeight) {
    resultSection.style.display = "block";

    const totalTiles = data.totalTiles;
    const orientation = data.horizontalOrientation ? "vízszintes" : "függőleges";
    const tileWidth = data.tileWidth;
    const tileHeight = data.tileHeight;

    tileCountElement.innerHTML = `
          <strong>Szükséges járólapok száma:</strong> ${totalTiles} db<br>
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

    // Calculate scale factor based on actual dimensions
    const scaleFactor = previewWidth / (data.areaWidth * 100);

    tilePreviewElement.style.width = `${previewWidth}px`;
    tilePreviewElement.style.height = `${previewHeight}px`;

    const tiles = data.tiles;

    tiles.forEach((tile) => {
      const tileElement = document.createElement("div");
      tileElement.className = "tile";

      tileElement.style.left = `${tile.x * 100 * scaleFactor}px`;
      tileElement.style.top = `${tile.y * 100 * scaleFactor}px`;
      tileElement.style.width = `${tile.width * 100 * scaleFactor}px`;
      tileElement.style.height = `${tile.height * 100 * scaleFactor}px`;

      tilePreviewElement.appendChild(tileElement);
    });
  }
});
