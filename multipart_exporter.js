
(
    function()
    {
        var button;

        Plugin.register('blockbench-multipart', 
        {
            title: 'Multipart Exporter',
            author: 'xokem',
            description: 'Your Description',
            version: '0.0.0',
            variant: 'both',
            onload() 
            {
                button = new Action('export-multipart', 
                {
                    name: 'Export Multipart',
                    description: 'Exports each selected shape to an individual model file.',
                    click: function()
                    {
                        Cube.all.forEach((cube, i, array) => 
                        {
                            cube.export = false;
                        });

                        const outputDir = Blockbench.pickDirectory(
                        {
                            title: "Select Output Directory"
                        });

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

                            const model = Codecs['java_block'].compile();

                            Blockbench.writeFile(path, {
                                content: model
                            });
                            
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