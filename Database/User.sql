CREATE TABLE [dbo].[User]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [username] VARCHAR(MAX) NOT NULL, 
    [email] VARCHAR(MAX) NOT NULL, 
    [createdDatetime] DATETIME NOT NULL, 
    [password] VARCHAR(MAX) NOT NULL, 
    [salt] VARBINARY(MAX) NOT NULL
)
