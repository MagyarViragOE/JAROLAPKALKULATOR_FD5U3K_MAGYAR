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

    const requestData = {
      width: width,
      height: height,
      tileSize: tileSize,
    };

    fetch("ide-majd-a-linket", {
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
        displayResults(data, width, height);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Hiba történt a számítás során. Kérjük, próbálja újra később.");
      });
  });

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
