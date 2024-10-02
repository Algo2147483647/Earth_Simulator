async function GetVisitedPoints() {
    const url = 'http://localhost:5000/get_visited_points';

    try {
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        result = JSON.parse((await response.json())["data"]);
    } catch (error) {
        console.error('Error:', error);
        return [];
    }

    const coordinatesArray = Object.values(result).map(city => city.coordinates);

    return coordinatesArray;
}
