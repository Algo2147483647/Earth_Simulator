async function GetVisitedPoints() {
    const url = 'http://localhost:5000/get_visited_points';

    try {
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        result = (await response.json())["data"];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }

    console.log(result)
    const coordinatesArray = Object.values(result).map(city => city.coordinates);

    return coordinatesArray;
}

async function GetVisitedTree() {
    const url = 'http://localhost:5000/get_visited_tree';

    try {
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log(response);
                const result = await response.json(); // Parse JSON data

        console.log(result); // Log the result (should be an array of arrays)
        return result.data;

    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}
