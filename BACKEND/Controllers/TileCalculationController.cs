using Microsoft.AspNetCore.Mvc;
using BACKEND.Models;
using BACKEND.Services;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TileCalculationController : ControllerBase
    {
        private readonly TileCalculationService _calculationService;

        public TileCalculationController(TileCalculationService calculationService)
        {
            _calculationService = calculationService;
        }

        [HttpGet("tile-sizes")]
        public ActionResult<List<string>> GetTileSizes()
        {
            return _calculationService.GetAvailableTileSizes();
        }

        [HttpPost("calculate")]
        public ActionResult<TileCalculationResponse> CalculateTiles([FromBody] TileCalculationRequest request)
        {
            if (request.AreaWidth <= 0 || request.AreaHeight <= 0)
            {
                return BadRequest("Area dimensions must be positive numbers");
            }

            try
            {
                var result = _calculationService.CalculateTiles(request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}