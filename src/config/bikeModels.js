// src/config/bikeModels.js

const BIKE_MODELS = [
    {
        id: 'mottu_sport_110i',
        name: 'Mottu Sport 110i',
        image: require('../assets/Mottu 110i.jpg'), // Use o caminho da sua imagem local
    },
    {
        id: 'honda_pop_100',
        name: 'Honda Pop 100',
        image: require('../assets/honda_pop_100.png'), // Se tiver uma imagem para a Pop 100
    },
    {
        id: 'Mottu Amazon-E',
        name: 'Mottu Amazon-E',
        image: require('../assets/Mottu Amazon-E.jpg'), // Se tiver uma imagem para a Factor 125
    },
    // Adicione mais modelos conforme necessário
    {
        id: 'selecione_modelo',
        name: 'Selecione um Modelo', // Opção padrão para o Picker
        image: null, // Não terá imagem associada
    },
];

export { BIKE_MODELS };