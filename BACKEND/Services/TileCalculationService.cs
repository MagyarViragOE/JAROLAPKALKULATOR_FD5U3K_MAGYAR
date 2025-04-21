using TileCalculator.Models;

namespace TileCalculator.Services
{
    public class TileCalculationService
    {
        private readonly Dictionary<string, TileSize> _availableTileSizes = new()
        {
            { "10x10", new TileSize(10, 10) },
            { "15x15", new TileSize(15, 15) },
            { "10x30", new TileSize(10, 30) },
            { "30x30", new TileSize(30, 30) },
            { "30x60", new TileSize(30, 60) },
            { "60x60", new TileSize(60, 60) },
            { "45x90", new TileSize(45, 90) },
            { "90x90", new TileSize(90, 90) }
        };

        public TileCalculationResponse CalculateTiles(TileCalculationRequest request)
        {
            if (!_availableTileSizes.TryGetValue(request.TileSize, out var tileSize))
            {
                throw new ArgumentException("Invalid tile size");
            }

            // Normal orientation (as specified in the tile size)
            var normalTiles = CalculateTileLayout(request.AreaWidth, request.AreaHeight, tileSize.Width, tileSize.Height);
            
            // Only calculate rotated orientation if width and height are different
            var rotatedTiles = tileSize.Width == tileSize.Height ? 
                normalTiles : // If square, rotation doesn't matter
                CalculateTileLayout(request.AreaWidth, request.AreaHeight, tileSize.Height, tileSize.Width);

            // For non-square tiles like 10x30, default orientation is vertical (10 width, 30 height)
            bool useNormalOrientation = normalTiles <= rotatedTiles;

            if (useNormalOrientation)
            {
                return new TileCalculationResponse
                {
                    TotalTiles = normalTiles,
                    Orientation = true, // true = using original orientation (width × height)
                    TileWidth = tileSize.Width,
                    TileHeight = tileSize.Height
                };
            }
            else
            {
                return new TileCalculationResponse
                {
                    TotalTiles = rotatedTiles,
                    Orientation = false, // false = rotated orientation (height × width)
                    TileWidth = tileSize.Height,
                    TileHeight = tileSize.Width
                };
            }
        }

        private int CalculateTileLayout(double areaWidth, double areaHeight, double tileWidth, double tileHeight)
        {
            int tilesInWidth = (int)Math.Ceiling(areaWidth / tileWidth);
            int tilesInHeight = (int)Math.Ceiling(areaHeight / tileHeight);
            return tilesInWidth * tilesInHeight;
        }

        public List<string> GetAvailableTileSizes()
        {
            return _availableTileSizes.Keys.ToList();
        }
    }
}