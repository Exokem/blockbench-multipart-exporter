
(
    function()
    {
        function removeAllCubesFromExport()
        {
            Cube.all.forEach((cube, i, array) => { cube.export = false });
        }

        function selectOutput()
        {
            return Blockbench.pickDirectory(
            {
                title: "Select Output Directory"
            });
        }

        function getAllCubesInGroup(group)
        {
            const cubes = new Set();

            var queue = [];
            queue.push(group);

            while (queue.length != 0)
            {
                const current = queue.shift();

                if (current instanceof Group)
                {
                    current.forEachChild((node) => 
                    {
                        // Assign nodes the name of their containing group.
                        node.bbmp_groupName = current.name;
                        queue.push(node);
                    });
                }

                else if (current instanceof Cube)
                {
                    cubes.add(current);
                }
            }

            return cubes;
        }

        function exportModel(path)
        {
            const model = Codecs['java_block'].compile();

            Blockbench.writeFile(path, {
                content: model
            });
        }

        Plugin.register('multipart_exporter', 
        {
            title: 'Multipart Exporter',
            author: 'xokem',
            description: 'Your Description',
            version: '0.0.0',
            variant: 'both',
            onload() 
            {
                new Action('export-group',
                {
                    name: 'Export Group',
                    description: 'Exports the selected group as one model.',
                    click: function()
                    {
                        removeAllCubesFromExport();

                        const group = Group.selected;
                        const cubes = getAllCubesInGroup(group);

                        cubes.forEach((cube, i, array) => { cube.export = true; });

                        const path = `${selectOutput()}\\${group.name}.json`;
                        exportModel(path);

                        Blockbench.showMessageBox({ message: `Exported ${path}` });
                    }
                });

                new Action('export-multipart', 
                {
                    name: 'Export Multipart',
                    description: 'Exports each selected shape to an individual model file.',
                    click: function()
                    {
                        removeAllCubesFromExport();

                        const outputDir = selectOutput();

                        var queue = [];
                        Group.all.forEach((group, i, array) => queue.push(group));

                        const exportSet = new Set();

                        while (queue.length != 0)
                        {
                            const current = queue.shift();

                            if (current instanceof Group)
                            {
                                current.forEachChild((node) => 
                                {
                                    node.bbmp_groupName = current.name;
                                    queue.push(node);
                                });
                            }

                            else if (current instanceof Cube && current.selected)
                            {
                                exportSet.add(current);
                            }
                        }

                        var progress = 0;

                        exportSet.forEach((cube) => 
                        {
                            cube.export = true;
                        
                            const path = `${outputDir}\\${cube.bbmp_groupName}_${cube.name}.json`;

                            exportModel(path);
                            
                            cube.export = false;

                            progress += 1 / exportSet.length;
                            Blockbench.setProgress(progress);
                        })

                        Blockbench.showMessageBox({ message: `Exported ${exportSet.size} Model(s)` });
                        Blockbench.setProgress(0);
                    }
                });
            }
        });
    }
)();