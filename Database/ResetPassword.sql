CREATE TABLE [dbo].[ResetPassword]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [userId] INT NOT NULL, 
    [createdDatetime] DATETIME NOT NULL, 
    [key] VARCHAR(MAX) NOT NULL
)
