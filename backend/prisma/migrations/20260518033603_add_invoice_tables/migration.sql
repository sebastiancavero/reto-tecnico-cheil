BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Customer] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(150) NOT NULL,
    [email] NVARCHAR(200) NOT NULL,
    [phone] NVARCHAR(20),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Customer_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Customer_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Invoice] (
    [id] INT NOT NULL IDENTITY(1,1),
    [number] NVARCHAR(20) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    [notes] NVARCHAR(500),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Invoice_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [customerId] INT NOT NULL,
    [issuedById] INT NOT NULL,
    CONSTRAINT [Invoice_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Invoice_number_key] UNIQUE NONCLUSTERED ([number])
);

-- CreateTable
CREATE TABLE [dbo].[InvoiceItem] (
    [id] INT NOT NULL IDENTITY(1,1),
    [quantity] INT NOT NULL,
    [unitPrice] DECIMAL(10,2) NOT NULL,
    [productName] NVARCHAR(255) NOT NULL,
    [productCategory] NVARCHAR(100) NOT NULL,
    [subtotal] DECIMAL(10,2) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [InvoiceItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [invoiceId] INT NOT NULL,
    [productId] INT,
    CONSTRAINT [InvoiceItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [Invoice_customerId_fkey] FOREIGN KEY ([customerId]) REFERENCES [dbo].[Customer]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [Invoice_issuedById_fkey] FOREIGN KEY ([issuedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[InvoiceItem] ADD CONSTRAINT [InvoiceItem_invoiceId_fkey] FOREIGN KEY ([invoiceId]) REFERENCES [dbo].[Invoice]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
