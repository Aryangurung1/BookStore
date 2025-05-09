using System;

namespace BookHeaven.DTOs.Broadcast;

public class BroadcastMessageDto
{
    public required string Message { get; set; }
    public string? Subject { get; set; }
    public DateTime SentAt { get; set; }
}