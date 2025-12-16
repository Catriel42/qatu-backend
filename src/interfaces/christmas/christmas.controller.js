class ChristmasController {
    async sayMerryChristmas(req, res) {
        res.json({ message: 'Merry Christmas! 🎄🎅' });
    }
}

export default new ChristmasController();
