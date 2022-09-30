<?php

namespace Loqate\Tag\Model\ResourceModel;

use Magento\Framework\Model\ResourceModel\Db\AbstractDb;

class SettingsData extends AbstractDb
{
    /**
     * SettingsData constructor
     */
    protected function _construct()
    {
        $this->_init('loqate_tag_settingsdata', 'loqate_tag_settingsdata_id');
    }
}
