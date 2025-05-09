using BookHeaven.DTOs.Cart;
using BookHeaven.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Member")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        private int GetMemberId() 
        {
            var memberId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("memberId")?.Value;
            if (string.IsNullOrEmpty(memberId))
            {
                throw new InvalidOperationException("Member ID is missing.");
            }
            if (!int.TryParse(memberId, out int id))
            {
                throw new InvalidOperationException("Invalid Member ID.");
            }
            return id;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var cart = await _cartService.GetCartAsync(GetMemberId());
            return Ok(cart);
        }

        [HttpPost]
        public async Task<IActionResult> AddOrUpdateCart(UpdateCartDto dto)
        {
            try
            {
                await _cartService.AddOrUpdateCartItemAsync(GetMemberId(), dto);
                return Ok(new { message = "Cart updated." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{bookId}")]
        public async Task<IActionResult> RemoveFromCart(int bookId)
        {
            await _cartService.RemoveCartItemAsync(GetMemberId(), bookId);
            return Ok(new { message = "Item removed." });
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            await _cartService.ClearCartAsync(GetMemberId());
            return Ok(new { message = "Cart cleared." });
        }
    }
}