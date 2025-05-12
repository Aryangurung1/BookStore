using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookHeaven.Migrations
{
    /// <inheritdoc />
    public partial class AddBookCategoryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "JoinDate",
                table: "Staffs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Books",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsAwardWinner",
                table: "Books",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsBestseller",
                table: "Books",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "AdminId",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$l3Gl9gpKINvXdj/YvQGkeuQwUnvGGfgyGR7b7czAxEWYt8Ip86R3q");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JoinDate",
                table: "Staffs");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "IsAwardWinner",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "IsBestseller",
                table: "Books");

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "AdminId",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$3y8O8myhSBXJvkH/CFyc2uHvx79K7Czl4Wme8ex/U3cpMBjJ6fhbO");
        }
    }
}
