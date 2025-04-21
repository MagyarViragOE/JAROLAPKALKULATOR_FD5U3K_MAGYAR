namespace TileCalculator.Models
{
    public class TileCalculationRequest
    {
        public double AreaWidth { get; set; }
        public double AreaHeight { get; set; }
        public string TileSize { get; set; }
    }

    public class TileCalculationResponse
    {
        public int TotalTiles { get; set; }
        public bool Orientation { get; set; } // true = horizontal, false = vertical
        public double TileWidth { get; set; }
        public double TileHeight { get; set; }
    }

    public class TileSize
    {
        public double Width { get; set; }
        public double Height { get; set; }

        public TileSize(double width, double height)
        {
            Width = width;
            Height = height;
        }
    }
}