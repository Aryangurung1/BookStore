using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookHeaven.Migrations
{
    /// <inheritdoc />
    public partial class AddPositionToStaff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Staffs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "OrderId1",
                table: "ProcessedOrders",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ClaimCode",
                table: "Orders",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Orders",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "Orders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "OrderItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinDate",
                table: "Members",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Staffs_Email",
                table: "Staffs",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcessedOrders_OrderId1",
                table: "ProcessedOrders",
                column: "OrderId1",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Members_Email",
                table: "Members",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admins_Email",
                table: "Admins",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProcessedOrders_Orders_OrderId1",
                table: "ProcessedOrders",
                column: "OrderId1",
                principalTable: "Orders",
                principalColumn: "OrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcessedOrders_Orders_OrderId1",
                table: "ProcessedOrders");

            migrationBuilder.DropIndex(
                name: "IX_Staffs_Email",
                table: "Staffs");

            migrationBuilder.DropIndex(
                name: "IX_ProcessedOrders_OrderId1",
                table: "ProcessedOrders");

            migrationBuilder.DropIndex(
                name: "IX_Members_Email",
                table: "Members");

            migrationBuilder.DropIndex(
                name: "IX_Admins_Email",
                table: "Admins");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Staffs");

            migrationBuilder.DropColumn(
                name: "OrderId1",
                table: "ProcessedOrders");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "JoinDate",
                table: "Members");

            migrationBuilder.AlterColumn<string>(
                name: "ClaimCode",
                table: "Orders",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
