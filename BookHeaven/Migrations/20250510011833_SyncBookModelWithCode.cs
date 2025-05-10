using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookHeaven.Migrations
{
    /// <inheritdoc />
    public partial class SyncBookModelWithCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "AdminId",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$seXUdvzCqWJZbkJ7lfHBQuCRY9Cn1mO9gpWyBas4BHJaFgTvcWoCq");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "AdminId",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$3y8O8myhSBXJvkH/CFyc2uHvx79K7Czl4Wme8ex/U3cpMBjJ6fhbO");
        }
    }
}
