using BACKEND.Models;

namespace BACKEND.Services
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

            var normalResponse = CalculateTileLayout(request.AreaWidth, request.AreaHeight, tileSize.Width, tileSize.Height, true);
            
            var rotatedResponse = tileSize.Width == tileSize.Height ? 
                normalResponse : 
                CalculateTileLayout(request.AreaWidth, request.AreaHeight, tileSize.Height, tileSize.Width, false);

            // (including partials)!!
            int normalPieces = normalResponse.Tiles.Count;
            int rotatedPieces = rotatedResponse.Tiles.Count;

            // Choose the orientation with fewer actual pieces
            return normalPieces <= rotatedPieces ? normalResponse : rotatedResponse;
        }

        private TileCalculationResponse CalculateTileLayout(double areaWidth, double areaHeight, double tileWidth, double tileHeight, bool normalOrientation)
        {
            int tilesInWidth = (int)Math.Ceiling(areaWidth / tileWidth);
            int tilesInHeight = (int)Math.Ceiling(areaHeight / tileHeight);
            
            int completeTilesX = (int)(areaWidth / tileWidth);
            int completeTilesY = (int)(areaHeight / tileHeight);
            
            double remainingWidth = areaWidth % tileWidth;
            double remainingHeight = areaHeight % tileHeight;
            
            var tiles = new List<TileInfo>();
            
            // complete tiles
            for (int y = 0; y < completeTilesY; y++)
            {
                for (int x = 0; x < completeTilesX; x++)
                {
                    tiles.Add(new TileInfo
                    {
                        X = x * tileWidth,
                        Y = y * tileHeight,
                        Width = tileWidth,
                        Height = tileHeight,
                        ColorIndex = (x + y) % 3
                    });
                }
            }
            
            // partial tiles along the right edge
            if (remainingWidth > 0)
            {
                for (int y = 0; y < completeTilesY; y++)
                {
                    tiles.Add(new TileInfo
                    {
                        X = completeTilesX * tileWidth,
                        Y = y * tileHeight,
                        Width = remainingWidth,
                        Height = tileHeight,
                        ColorIndex = (completeTilesX + y) % 3
                    });
                }
            }
            
            // partial tiles along the bottom edge
            if (remainingHeight > 0)
            {
                for (int x = 0; x < completeTilesX; x++)
                {
                    tiles.Add(new TileInfo
                    {
                        X = x * tileWidth,
                        Y = completeTilesY * tileHeight,
                        Width = tileWidth,
                        Height = remainingHeight,
                        ColorIndex = (x + completeTilesY) % 3
                    });
                }
            }
            
            //  the corner partial tile (if needed)
            if (remainingWidth > 0 && remainingHeight > 0)
            {
                tiles.Add(new TileInfo
                {
                    X = completeTilesX * tileWidth,
                    Y = completeTilesY * tileHeight,
                    Width = remainingWidth,
                    Height = remainingHeight,
                    ColorIndex = (completeTilesX + completeTilesY) % 3
                });
            }
            
            double tileArea = tilesInWidth * tilesInHeight * tileWidth * tileHeight / 10000;
            
            return new TileCalculationResponse
            {
                TotalTiles = tilesInWidth * tilesInHeight, 
                Orientation = normalOrientation,
                TileWidth = tileWidth,
                TileHeight = tileHeight,
                AreaWidth = areaWidth,
                AreaHeight = areaHeight,
                TotalArea = tileArea, 
                Tiles = tiles
            };
        }

        public List<string> GetAvailableTileSizes()
        {
            return _availableTileSizes.Keys.ToList();
        }
    }
}