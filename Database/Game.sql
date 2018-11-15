CREATE TABLE [dbo].[Game]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [lengthOfGame] TIME NOT NULL, 
    [single] BIT NOT NULL, 
    [userIdOne] INT NOT NULL, 
    [userIdTwo] INT NULL, 
    [userOneScore] VARCHAR(MAX) NOT NULL, 
    [userTwoScore] VARCHAR(MAX) NULL, 
    [userOneGame] VARCHAR(MAX) NOT NULL, 
    [userTwoGame] VARCHAR(MAX) NULL, 
    [ranked] BIT NOT NULL
)
